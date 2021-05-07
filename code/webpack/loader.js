/*
 * @Author: mokinzhao
 * @Date: 2021-04-24 20:44:36
 * @Description: px2rem-loader
 */

px2rem - loader;

function loader(soure) {
  console.log(source);
  console.log("px2rem-loader");

  let options = loaderUtils.getOptions(this);
  let px2rem = new Px2rem({ remUnit: 75, remPrecision: 8 });
  console.log(source);
  let targerSource = px2rem.generateRem(source);
}

module.expots = loader;
