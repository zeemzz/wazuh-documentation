const hash = window.location.href.split('#')[1] || '';
init(hash);

/**
* Starts the functionality only when the main content is loaded
* @param {string} hash String that appearse after the sign # in the URL.
*/
function init(hash) {
  let swaggerObserver = null;
  const idSeparator = '-dot-';
  const config = {childList: true, subtree: true};
  const params = hashToId(hash, idSeparator);
  const swaggerLoaded = function(mutationsList, observer) {
    for (i = 0; i < mutationsList.length; i++) {
      if (mutationsList[i].type === 'childList'
      && $(mutationsList[i].addedNodes[0]).hasClass('wrapper')
      && !$(mutationsList[i].addedNodes[0]).hasClass('information-container')) {
        // When Swagger is finally loaded
        if ($(mutationsList[i].addedNodes[0]).find('.opblock-tag-section').length > 0) {
          // Create and observer for every tag section
          $('.opblock-tag').each(function() {
            observeTagSection(params, this, config, idSeparator );
          });
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
* @param {obj} tagSection DOM object correstponding to the tag section
* @param {obj} config Configuration for the observer
* @param {string} idSeparator Short string acting as proper separator (instead of '.' or '\.')
*/
function observeTagSection(params, tagSection, config, idSeparator) {
  const tag = $(tagSection).data('tag');
  let operationObserver = null;
  const operationLoaded = function(mutationsList, observer) {
    for (i = 0; i < mutationsList.length; i++) {
      if ( mutationsList[i].type === 'childList' && $(mutationsList[i].addedNodes[0]).find('.opblock').length > 0 ) {
        // When operation block is finally loaded:
        $(mutationsList[i].addedNodes[0]).find('.opblock').each(function() {
          // Fix IDs and add endpoint link
          const newHash = idToHash($(this).attr('id'), idSeparator);
          $(this).attr('id', newHash.id);
          if ( $(this).find('a.headerlink').length == 0 ) {
            $(this).children('.opblock-summary').append('<a class="headerlink" href="#' + newHash.hash + '" title="Permalink to this headline">¶</a>');
          }
          $(this).find('a.headerlink').on('click', function(e) {
            e.stopPropagation();
            const headerHeight = getHeaderHeight();
            $('html, body').scrollTop($('#'+newHash.id).offset().top - headerHeight );
          });
        });
      }
    }
  };
  operationObserver = new MutationObserver(operationLoaded);
  operationObserver.observe($('#operations-tag-'+tag).parent()[0], config);
  if ( tag === params.operation ) {
    $('#operations-tag-'+params.operation).click();
    if ( params.endpoint != undefined ) {
      firstLoadedEnpoint(params, config);
    } else {
      const headerHeight = getHeaderHeight();
      $('html, body').scrollTop($('#operations-tag-'+params.operation).offset().top - headerHeight );
    }
  }
  $(tagSection).on('click', function(e) {
    if ( !$(this).parent().hasClass('is-open')) {
      const newHash = {};
      const headerHeight = getHeaderHeight();
      newHash.id = $(this).attr('id');
      newHash.hash = $(this).data('tag');
      window.location.hash = newHash.hash;
      $('html, body').scrollTop($('#'+newHash.id).offset().top - headerHeight );
    }
  });
}

/**
* Scroll to a particular endpoint at first load if the URL contains the proper hash
* @param {obj} params Info extracted from the hash. Contains target id, operation, and endpoint identification
* @param {obj} config Configuration for the observer
*/
function firstLoadedEnpoint(params, config) {
  let tagSectionObserver = null;
  params = hashToId(params.hash, params.idSeparator);
  const endpointsLoaded = function(mutationsList, observer) {
    for (i = 0; i < mutationsList.length; i++) {
      if ( mutationsList[i].type === 'childList') {
        const headerHeight = getHeaderHeight();
        $('html, body').scrollTop($('#'+params.id).offset().top - headerHeight*2 );
      }
    }
    tagSectionObserver.disconnect();
    $('#'+params.id+ ' .opblock-summary').click();
  };

  tagSectionObserver = new MutationObserver(endpointsLoaded);
  tagSectionObserver.observe($('#operations-tag-'+params.operation).siblings('div')[0], config);
}

/**
* Extract the information from the hash
* @param {string} hash String that contains the information to scroll to an element
* @return {object} Object containing the structured information extracted from the hash
* @param {string} idSeparator Short string acting as proper separator (instead of '.' or '\.')
*/
function hashToId(hash, idSeparator) {
  const result = {};
  result.idSeparator = idSeparator;
  result.hash = hash;
  if ( hash.length > 0) {
    [result.operation, result.endpoint] = hash.split('+');
    if ( result.endpoint != undefined ) {
      $('.opblock').each(function() {
        if ( $(this).attr('id').match('operations-' + result.operation + '-api')
        && $(this).attr('id').match(result.endpoint) ) {
          result.id = idToHash($(this).attr('id'), idSeparator).id;
        }
      });
    } else {
      result.id = hash;
    }
  }
  return result;
}

/**
* Extract the information from the endpoint id
* @param {string} id ID attribute for the endpoint
* @param {string} idSeparator Short string acting as proper separator (instead of '.' or '\.')
* @return {object} Object containing the sturecured information extracted from the id
*/
function idToHash(id, idSeparator) {
  const result = {};
  result.idSeparator = idSeparator;
  result.id = id.replace(/\\\./g, idSeparator);
  const extactingTemp = result.id.split(idSeparator);
  result.endpoint = extactingTemp[extactingTemp.length - 1];
  result.operation = extactingTemp[0].replace('operations-', '').replace('-api', '');
  result.hash = result.operation + '+' + result.endpoint;
  // If operation composed name is written using '_' in the id the next line will fix it to use '-'
  result.id = result.id.replace(result.operation.split('-').join('_'), result.operation);

  return result;
}

/**
* Provides the apropiate height of the header to be considered when scrolling
* @return {number} half of the current height of the header
*/
function getHeaderHeight() {
  const headerHeight = $('#header').height();
  const currentScoll = window.pageYOffset || document.documentElement.scrollTop;
  const result = (currentScoll <= headerHeight) ? headerHeight : $('#header-sticky').height();
  return result/2;
}
