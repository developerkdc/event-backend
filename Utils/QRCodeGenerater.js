import QRCode from "qrcode";
const generateQR = async (text) => {
  // var opts = {
  //     errorCorrectionLevel: 'H',
  //     type: 'image/jpeg',
  //     quality: 0.3,
  //     margin: 1,
  //     color: {
  //       dark:"#010599FF",
  //       light:"#FFBF60FF"
  //     }
  //   }
  //   try {
  // console.log(await QRCode.toDataURL(text));
  //     QRCode.toString('https://kdigitalcurry.com', {
  //         errorCorrectionLevel: 'H',
  //         type: 'png'
  //       }, function(err, data) {
  //         if (err) throw err;
  //         console.log(data);
  //         return data;
  //       });
  //   } catch (err) {
  //     console.error(err);
  //   }
  return new Promise((resolve, reject) => {
    QRCode.toBuffer(
      text,
      {
        errorCorrectionLevel: "H",
        type: "png",
      },
      function (err, data) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
        //   console.log(data);
          resolve(data);
        }
      }
    );
  });
};

export default generateQR;
