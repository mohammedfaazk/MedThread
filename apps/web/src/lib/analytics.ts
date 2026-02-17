import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Session management
let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
  }
  return sessionId;
}

// Page view tracking
let currentPage: string | null = null;
let pageStartTime: number | null = null;

export const analytics = {
  /**
   * Track custom event
   */
  trackEvent(eventName: string, eventCategory: string, properties?: Record<string, any>) {
    try {
      axios.post(`${API_URL}/analytics/event`, {
        eventName,
        eventCategory,
        properties,
        sessionId: getSessionId(),
        page: window.location.pathname,
      }).catch(err => console.error('Analytics error:', err));
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  },

  /**
   * Track page view
   */
  trackPageView(page?: string, title?: string) {
    try {
      const pagePath = page || window.location.pathname;
      const pageTitle = title || document.title;

      // Track previous page duration
      if (currentPage && pageStartTime) {
        const duration = Date.now() - pageStartTime;
        axios.post(`${API_URL}/analytics/pageview`, {
          page: currentPage,
          title: pageTitle,
          sessionId: getSessionId(),
          referrer: document.referrer,
          duration,
        }).catch(err => console.error('Analytics error:', err));
      }

      // Start tracking new page
      currentPage = pagePath;
      pageStartTime = Date.now();

      // Track new page view
      axios.post(`${API_URL}/analytics/pageview`, {
        page: pagePath,
        title: pageTitle,
        sessionId: getSessionId(),
        referrer: document.referrer,
      }).catch(err => console.error('Analytics error:', err));
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  },

  /**
   * Track conversion
   */
  trackConversion(conversionType: string, value?: number, metadata?: Record<string, any>) {
    try {
      axios.post(`${API_URL}/analytics/conversion`, {
        conversionType,
        value,
        metadata,
        sessionId: getSessionId(),
      }).catch(err => console.error('Analytics error:', err));
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  },

  /**
   * Track post view
   */
  trackPostView(postId: string) {
    try {
      axios.post(`${API_URL}/analytics/post-view/${postId}`)
        .catch(err => console.error('Analytics error:', err));
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  },

  /**
   * Track button click
   */
  trackClick(buttonName: string, properties?: Record<string, any>) {
    this.trackEvent('click', 'engagement', {
      buttonName,
      ...properties,
    });
  },

  /**
   * Track form submission
   */
  trackFormSubmit(formName: string, properties?: Record<string, any>) {
    this.trackEvent('form_submit', 'engagement', {
      formName,
      ...properties,
    });
  },

  /**
   * Track search
   */
  trackSearch(query: string, results?: number) {
    this.trackEvent('search', 'engagement', {
      query,
      results,
    });
  },

  /**
   * Track share
   */
  trackShare(contentType: string, contentId: string, platform?: string) {
    this.trackEvent('share', 'engagement', {
      contentType,
      contentId,
      platform,
    });
  },

  /**
   * Track video play
   */
  trackVideoPlay(videoId: string, title?: string) {
    this.trackEvent('video_play', 'engagement', {
      videoId,
      title,
    });
  },

  /**
   * Track download
   */
  trackDownload(fileName: string, fileType?: string) {
    this.trackEvent('download', 'engagement', {
      fileName,
      fileType,
    });
  },
};

// Auto-track page views on route change
if (typeof window !== 'undefined') {
  // Track initial page view
  analytics.trackPageView();

  // Track page unload
  window.addEventListener('beforeunload', () => {
    if (currentPage && pageStartTime) {
      const duration = Date.now() - pageStartTime;
      navigator.sendBeacon(
        `${API_URL}/analytics/pageview`,
        JSON.stringify({
          page: currentPage,
          sessionId: getSessionId(),
          duration,
        })
      );
    }
  });
}
