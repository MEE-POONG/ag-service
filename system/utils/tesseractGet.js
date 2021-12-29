
exports.readImg = async (worker, imagePath) => {
  const {
    data: { text }
  } = await worker.recognize(imagePath)
  return text
}
