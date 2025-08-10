export default (message: any) => {
  return notification.success({
    message: "Ok",
    description: message,
    placement: "bottomRight",
    duration: 4,
  })
}
