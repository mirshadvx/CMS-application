from loguru import logger
import sys

logger.remove()

logger.add(sys.stdout, level="DEBUG", backtrace=True, diagnose=True)
logger.add("logs/debug.log", rotation="10 MB", level="DEBUG", compression="zip")

logger.add("logs/error.log", rotation="10 MB", level="ERROR", compression="zip")
