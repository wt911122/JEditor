export const makeElement = function(options = {}) {
  let key, value

  const tag = options.tag

  const element = document.createElement(tag)

  if(tag === 'style') {
    element.type = 'text/css';
    if (element.styleSheet){
      element.styleSheet.cssText = options.cssText;
    } else {
      element.appendChild(document.createTextNode(options.cssText));
    }
    return element;
  }
  if (options.attributes) {
    for (key in options.attributes) {
      value = options.attributes[key]
      element.setAttribute(key, value)
    }
  }

  if (options.style) {
    for (key in options.style) {
      value = options.style[key]
      element.style[key] = value
    }
  }

  if (options.data) {
    for (key in options.data) {
      value = options.data[key]
      element.dataset[key] = value
    }
  }

  if (options.className) {
    
    options.className.forEach((className) => {
      console.log(className)
      element.classList.add(className)
    })
  }

  if (options.textContent !== undefined) {
    element.textContent = options.textContent
  }

  if (options.childNodes) {
    [].concat(options.childNodes).forEach((childNode) => {
      element.appendChild(childNode)
    })
  }

  return element
}