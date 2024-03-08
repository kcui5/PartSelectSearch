export function getUrl(inventoryID, manufactureName, partNumber, description) {
  return (
    "https://www.partselect.com/" + hyphenateText(`PS${inventoryID} ${manufactureName} ${partNumber} ${description}`
    ) +".htm"
  );
}
function hyphenateText(text) {
  return text.replace(/\s+/g, "-").toLowerCase();
}

export function getImageUrl(inventoryID,imageOrder,partImageSize,hasImage = false,isWebP = false) {
  let imageExtension = ".jpg";
  if (isWebP) {
    imageExtension = ".webp";
  }

  if (!hasImage) {
    return `https://www.partselect.com/assets/images/noimage_${partImageSize}${imageExtension}`;
  } else {
    return `https://www.partselect.com/assets/partimages/${inventoryID}_${imageOrder}_${partImageSize}${imageExtension}`;
  }
}

const PartImageSize = {
  SMALL: "S",
  MEDIUM: "M",
  LARGE: "L",
};
