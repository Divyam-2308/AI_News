"""
images.py
---------
Free image handling — no Firebase Storage, no Cloudinary, no API key.

Article thumbnails are hotlinked from their original sources (RSS media
tags / og:image) and resized & compressed on the fly by images.weserv.nl,
a free image proxy/CDN. This:

  * keeps emails light (560px vs full-size originals),
  * avoids hotlink-blocking (the proxy fetches server-side),
  * gives the webApp a stable, resizable image host.

Every email/webApp image URL is produced by `resize_image_url`.
"""

import urllib.parse

_WESERV_BASE = "https://images.weserv.nl/"


def resize_image_url(
    url: str | None,
    width: int = 560,
    height: int | None = None,
    quality: int = 80,
    max_source_len: int = 300,
) -> str:
    """
    Returns a weserv-proxied, resized URL for the given source image.

    Args:
        url:            Original image URL (http/https only)
        width:          Target width in pixels
        height:         Optional target height (weserv crops to fit)
        quality:        JPEG quality 0-100
        max_source_len: Skip absurdly long URLs (spammy tracking params)

    Returns:
        Proxied URL string, or "" when the source is missing/unsuitable.
    """
    if not url or not url.startswith(("http://", "https://")):
        return ""
    if len(url) > max_source_len:
        return ""

    params: dict[str, str] = {
        "url":  urllib.parse.quote(url, safe=""),
        "w":    str(width),
        "q":    str(quality),
        "fit":  "cover",
    }
    if height:
        params["h"] = str(height)

    return f"{_WESERV_BASE}?{urllib.parse.urlencode(params)}"


def email_image_url(url: str | None, width: int = 560, height: int | None = None) -> str:
    """Resized image URL for emails (safe for Resend's character limits)."""
    return resize_image_url(url, width=width, height=height, quality=80, max_source_len=300)