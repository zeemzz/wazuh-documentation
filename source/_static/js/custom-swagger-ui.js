jQuery(function($) {
  // hash => agents+get_agent_upgrade
  // id   => operations-agents-api\.controllers\.agents_controller\.get_agent_upgrade
  const hash = window.location.href.split('#')[1] || '';
  const idSeparator = '-dot-';

  init(hash);

  /**
    * Starts the functionality only when the main content is loaded
    * @param {string} hash String that appearse after the sign # in the URL.
    */
  function init(hash) {
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
            // Create and observer for every tag section
            $('.opblock-tag').each(function() {
              const currentTag = $(this).data('tag');
              tags.push(currentTag);
              // $(this).on('click', function(){
              // window.location.hash = currentTag;
              // });
              observeTagSection(params, currentTag, config );
            });

            // openOperation(params, tags, config);
            swaggerObserver.disconnect();
          }
        }
      }
    };
    swaggerObserver = new MutationObserver(swaggerLoaded);
    swaggerObserver.observe($('main #swagger-ui')[0], config);
  }

  /**
    * Observes and react to the changes in a particular tag section
    * @param {obj} params Info extracted from the hash. Contains target id, operation, and endpoint identification
    * @param {string} tag Name of the tag being checked
    * @param {obj} config Configuration for the observer
    */
  function observeTagSection(params, tag, config) {
    let operationObserver = null;
    const operationLoaded = function(mutationsList, observer) {
      for (i = 0; i < mutationsList.length; i++) {
        if ( mutationsList[i].type === 'childList' && $(mutationsList[i].addedNodes[0]).find('.opblock').length > 0 ) {
          // When operation block is finally loaded:
          $(mutationsList[i].addedNodes[0]).find('.opblock').each(function() {
            // Fix IDs
            $(this).attr('id', $(this).attr('id').replace(/\\\./g, idSeparator));
            // Add endpoint link
            const newHash = idToHash($(this).attr('id'));
            $(this).children('.opblock-summary').append('<a class="headerlink" href="#' + newHash.hash + '" title="Permalink to this headline">¶</a>');
            $(this).find('a.headerlink').on('click', function(e) {
              e.stopPropagation();
              $('html, body').scrollTop($('#'+newHash.id).offset().top);
            });
          });
          scrollToEndpoint(params.id);
        }
      }
    };
    operationObserver = new MutationObserver(operationLoaded);
    operationObserver.observe($('#operations-tag-'+tag).parent()[0], config);
    if ( tag === params.operation ) {
      $('#operations-tag-'+params.operation).click();
    }
  }

  /**
    * Scroll to a particular endpoint
    * @param {string} id Id of the endpoint that needs to be located
    */
  function scrollToEndpoint(id) {
    if ( $('#'+id).length > 0 ) {
      $('html, body').scrollTop($('#'+id).offset().top - $('#header-sticky').height()-10);
    }
  }

  /**
    * Extract the information from the hash
    * @param {string} hash String that contains the information to scroll to an element
    * @return {object} Object containing the sturecured information extracted from the hash
    */
  function hashToId(hash) {
    const result = {};
    result.hash = hash;
    if ( hash.length > 0) {
      [result.operation, result.endpoint] = hash.split('+');
      if ( result.endpoint != undefined ) {
        result.id = 'operations-' + result.operation + '-api' + idSeparator + 'controllers' + idSeparator + result.operation + '_controller' + idSeparator + result.endpoint;
      } else {
        result.id = hash;
      }
    }
    return result;
  }

  /**
    * Extract the information from the endpoint id
    * @param {string} id ID attribute for the endpoint
    * @return {object} Object containing the sturecured information extracted from the id
    */
  function idToHash(id) {
    const result = {};
    const extactingTemp = id.split(idSeparator);
    result.id = id;
    result.endpoint = extactingTemp[extactingTemp.length - 1];
    result.operation = extactingTemp[0].split('-')[1];
    result.hash = result.operation + '+' + result.endpoint;

    return result;
  }
});
