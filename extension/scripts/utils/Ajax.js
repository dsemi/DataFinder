/* global XMLHttpRequest, define */

define(function(requires) {
  var GET = 'GET',
      POST = 'POST',
      HEAD = 'HEAD',
      HEADERS_RECEIVED = 2,
      LOADING = 3,
      DONE = 4,
      STATUS_OK = 200;

  /**
   * Builder class for putting together Ajax requests.
   * @param {string} method The HTTP method to be used for this request.
   * @param {string} url The URL of this request.
   * @param {boolean=} async Whether to perform this request asynchronously.
   */
  function Builder(method, url, async) {
    async = async === undefined ? true : async;
    this._req = new XMLHttpRequest();
    this._req.open(method, url, async);
  }

  Builder.prototype = {
    _loading : function(req) {},

    _done : function(req) {
      switch (req.status) {
        case STATUS_OK:
          this._success(req.response, req);
          break;
        default:
          this._fail(req);
          break;
      }
    },

    _fail : function() {},

    _headers : function() {},

    _success : function() {},

    done : function(callback) {
      this._done = callback;
      return this;
    },

    fail : function(callback) {
      this._fail = callback;
      return this;
    },

    headers : function(callback) {
      this._headers = callback;
      return this;
    },

    loading : function(callback) {
      this._loading = callback;
      return this;
    },

    progress : function(callback) {
      this._progress = callback;
      return this;
    },

    /**
     * Sets the response type for this request.
     * @param {string} type The response type.
     * @return {Ajax.Builder} This Ajax.Builder.
     */
    responseType : function(type) {
      this._req.responseType = type;
      return this;
    },

    send : function(data) {
      var builder = Object.create(this),
          req = this._req;

      req.onreadystatechange = function() {
        switch (req.readyState) {
          case HEADERS_RECEIVED:
            builder._headers(req);
            break;
          case LOADING:
            builder._loading(req);
            break;
          case DONE:
            builder._done(req);
            break;
          default:
            break;
          }
        };

      if (this._progress) {
        req.addEventListener('progress', this._progress);
      }

      req.send(data);
    },

    /**
     * Sets a value to the given HTTP header.
     * @param {string} header Name of an HTTP header.
     * @param {string} value The value to set to the header.
     * @return This Ajax.Builder
     */
    setHeader : function(header, value) {
      this._req.setRequestHeader(header, value);
      return this;
    },

    success : function(callback) {
      this._success = callback;
      return this;
    }
  };

  return {
    /**
     * Constructs a new Ajax builder with the HTTP method set to HEAD.
     * @param {string} url
     * @param {boolean=} async Whether to perform this request asynchronously.
     * @return {Ajax.Builder}
     */
    head : function(url, async) {
      return new Builder(HEAD, url, async);
    },

    /**
     * Constructs a new Ajax builder with the HTTP method set to GET.
     * @param {string} url
     * @param {boolean=} async Whether to perform this request asynchronously.
     * @return {Ajax.Builder}
     */
    get : function(url, async) {
      return new Builder(GET, url, async);
    },

    /**
     * Constructs a new Ajax builder with the HTTP method set to POST.
     * @param {string} url
     * @param {boolean=} async Whether to perform this request asynchronously.
     * @return {Ajax.Builder}
     */
    post : function(url, async) {
      return new Builder(POST, url, async);
    }
  };
});
