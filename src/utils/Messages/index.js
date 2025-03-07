const generateMessage = (entity) => ({
  notFound: `${entity} not found`,
  alreadyExist: `${entity} already exist`,
  createdSuccessfully: `${entity} created successfully`,
  updatedSuccessfully: `${entity} updated successfully`,
  deletedSuccessfully: `${entity} deleted successfully`,
  failToCreate: `fail to create ${entity}`,
  failToUpdate: `fail to Update ${entity}`,
  failToDelete: `fail to Delete ${entity}`,
});

export const messages = {
  user: {
    ...generateMessage("user"),
    login: "loged in successfully",
    Credentials: "Invalid credentials",
    verify: "please verify account first",
    congrats: "congratulations, please login",
    bearerInvalid:"invalid bearer key",
    tokenRequired:"token is required"
  },
  email: { ...generateMessage("email"), failToSend: "email not sent plz try again" },
};