exports.random = () => {
  const num = Math.floor(Math.random() * (999 - 100 + 1) + 100);
  return num;
};
