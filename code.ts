figma.showUI(__html__, { width: 400, height: 260 });
figma.ui.onmessage = msg => {
  if (msg.type === "populateShow") {
    const layerMap = msg.data
    handleText(layerMap, figma.currentPage.selection[0])
  } else if (msg.type === "populateImage") {
    const { imageBytes, key } = msg.data
    handleImage(imageBytes, key, figma.currentPage.selection[0])
  } else if (msg.type === "cancel") {
    figma.closePlugin();
  }
};

const valueForCaseInsensitiveKey = (object, caseInsensitiveKey): string => {
  return object[Object.keys(object)
    .find(k => k.toLowerCase() === caseInsensitiveKey.toLowerCase())
  ];
}

const handleText = (layerMap, node) => {
  // if node has children, iterate and call this method again
  // otherwise see if it's a text field
  if ("children" in node) {
    for (const child of node.children) {
      handleText(layerMap, child)
    }
  } else {
    // check if node is text
    if ("characters" in node) {
      // match name to layerMap
      const value = valueForCaseInsensitiveKey(layerMap, node.name)
      if (value) {
        const fontName = node.fontName as FontName
        figma.loadFontAsync(fontName).then(() => {
          node.characters = value
        })
      }
    }
  }
}

const handleImage = (imageBytes, key, node) => {
  if ("children" in node) {
    for (const child of node.children) {
      handleImage(imageBytes, key, child)
    }
  } else {
    if ("fills" in node && node.name.toLowerCase() === key.toLowerCase()) {
      const imageRectangleNode = node as RectangleNode
      const image = figma.createImage(imageBytes)
      imageRectangleNode.fills = [{
        type: 'IMAGE',
        scaleMode: 'FILL',
        imageHash: image.hash
      }
      ];
    }
  }
}
