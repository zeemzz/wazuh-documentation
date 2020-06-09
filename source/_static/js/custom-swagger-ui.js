jQuery(function($) {
  // hash => agents+get_agent_upgrade
  // id   => operations-agents-api\.controllers\.agents_controller\.get_agent_upgrade
  const hash = window.location.href.split('#')[1] || '';

  hashAction(hash);

  /**
    * Starts action depending on hash
    * @param {string} hash String that appearse after the sign # in the URL.
    */
  function hashAction(hash) {
    let swaggerObserver = null;
    const config = {childList: true, subtree: true};
    const params = hashToId(hash);
    const tags = [];
    const swaggerLoaded = function(mutationsList, observer) {
      for (i = 0; i < mutationsList.length; i++) {
        if (mutationsList[i].type === 'childList'
        && $(mutationsList[i].addedNodes[0]).hasClass('wrapper')
        && !$(mutationsList[i].addedNodes[0]).hasClass('information-container')) {
          // When Swagger is finally loaded
          if ($(mutationsList[i].addedNodes[0]).find('.opblock-tag-section').length > 0) {
            $('.opblock-tag').each(function() {
              tags.push($(this).data('tag'));
            });
            openOperation(params, tags, config);
          }
        }
      }
    };
    if ( hash.length > 0) {
      swaggerObserver = new MutationObserver(swaggerLoaded);
      swaggerObserver.observe($('main #swagger-ui')[0], config);
    }
  }

  /**
    * Opens the operation tag specified in the hash
    * @param {obj} params Info extracted from the hash. Contains target id, operation, and endpoint identification
    * @param {array} tags List of operation tags that were loaded
    * @param {obj} config configuration for the observer
    */
  function openOperation(params, tags, config) {
    let operationObserver = null;
    const operationLoaded = function(mutationsList, observer) {
      for (i = 0; i < mutationsList.length; i++) {
        if (mutationsList[i].type === 'childList') {
          $(mutationsList[i].addedNodes[0]).find('.opblock').each(function() {
            $(this).attr('id', $(this).attr('id').replace(/\\\./g, '-dot-'));
          });
          // When operation block is finally loaded
          scrollToEndpoint(params.id);
        }
      }
    };
    operationObserver = new MutationObserver(operationLoaded);
    operationObserver.observe($('#operations-tag-'+params.operation).parent()[0], config);
    $('#operations-tag-'+params.operation).click();
  }

  /**
    * Scroll to a particular endpoint
    * @param {string} id Id of the endpoint that needs to be located
    */
  function scrollToEndpoint(id) {
    if ( $('#'+id).length > 0 ) {
      $('html, body').animate({
        scrollTop: $('#'+id).offset().top - $('#header-sticky').height()-10,
      }, 200);
    }
  }

  /**
    * Extract the inforation from the hash
    * @param {string} hash String that contains the information to scroll to an element
    * @return {object} Object containing the sturecured information extracted from the hash
    */
  function hashToId(hash) {
    const result = {};
    result.hash = hash;
    [result.operation, result.endpoint] = hash.split('+');
    result.id = 'operations-' + result.operation + '-api-dot-controllers-dot-' + result.operation + '_controller-dot-' + result.endpoint;
    return result;
  }
});
