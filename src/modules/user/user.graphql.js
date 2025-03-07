import { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLID } from "graphql";

export const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    _id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    role: { type: GraphQLString },
    isConfirmed: { type: GraphQLBoolean },
    bannedAt: { type: GraphQLString },
  }),
});
