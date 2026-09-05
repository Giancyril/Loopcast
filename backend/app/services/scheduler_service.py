import logging
from datetime import datetime
from typing import Dict, Any, List
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from backend.app.core.database import SessionLocal
from backend.app.models.social import Post, ApprovalLog
from platforms.manager import PlatformManager

logger = logging.getLogger("scheduler")

class SchedulerService:
    scheduler: BackgroundScheduler = None

    @classmethod
    def start(cls, interval_seconds: int = 15):
        """Starts background APScheduler polling service."""
        if cls.scheduler is None or not cls.scheduler.running:
            cls.scheduler = BackgroundScheduler()
            cls.scheduler.add_job(
                cls.publish_due_posts,
                "interval",
                seconds=interval_seconds,
                id="social_publish_job",
                replace_existing=True
            )
            cls.scheduler.start()
            logger.info(f"Cron Scheduler started (interval: {interval_seconds}s)")

    @classmethod
    def stop(cls):
        if cls.scheduler and cls.scheduler.running:
            cls.scheduler.shutdown(wait=False)
            logger.info("Cron Scheduler stopped.")

    @classmethod
    def publish_due_posts(cls) -> Dict[str, Any]:
        """Polls DB for posts due for publishing and executes distribution across platforms."""
        db: Session = SessionLocal()
        published_count = 0
        failed_count = 0
        now = datetime.utcnow()

        try:
            # Query posts ready for publishing: scheduled and due, or approved (immediate)
            due_posts: List[Post] = db.query(Post).filter(
                (Post.status == "approved") |
                ((Post.status == "scheduled") & (Post.scheduled_for <= now))
            ).all()

            for post in due_posts:
                platform_posts = post.platform_content or {}
                if not platform_posts:
                    continue

                all_succeeded = True
                publish_results = {}
                error_reasons = []

                for platform_name, text in platform_posts.items():
                    if not text:
                        continue
                    try:
                        adapter = PlatformManager.get_adapter(platform_name, db=db)
                        res = adapter.publish(text)
                        publish_results[platform_name] = res
                    except Exception as e:
                        all_succeeded = False
                        err_str = f"Platform {platform_name} error: {str(e)}"
                        error_reasons.append(err_str)
                        logger.error(err_str)

                if all_succeeded:
                    post.status = "published"
                    post.published_at = datetime.utcnow()
                    post.error_message = None
                    log = ApprovalLog(
                        post_id=post.id,
                        action="published",
                        reviewer_feedback=f"Successfully distributed to: {', '.join(platform_posts.keys())}",
                        diff_content=publish_results
                    )
                    db.add(log)
                    published_count += 1
                else:
                    post.status = "failed"
                    post.error_message = "; ".join(error_reasons)
                    log = ApprovalLog(
                        post_id=post.id,
                        action="failed",
                        reviewer_feedback=post.error_message
                    )
                    db.add(log)
                    failed_count += 1

                db.commit()

            return {
                "checked_at": now.isoformat(),
                "published_count": published_count,
                "failed_count": failed_count
            }
        except Exception as e:
            logger.exception("Error during scheduler poll: %s", str(e))
            return {"error": str(e)}
        finally:
            db.close()
