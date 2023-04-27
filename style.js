const Style = (id) => {

  switch (id) {
    case "1":
      return "2mm";
    case "2":
      return "3mm";
    case "3":
      return "4mm";
    case "4":
      return "5mm";
    case "5":
      return "Hoods";
    case "6":
      return "Boots";
    case "7":
      return "Gloves";
    case "8":
      return "Springsuits";
    case "10":
      return "Tops";
    default:  
  }
  return
};

module.exports = { Style }
