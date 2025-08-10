export default (message: any) => {
  return Modal.error({
    title: "Error",
    content: message,
  })
}
