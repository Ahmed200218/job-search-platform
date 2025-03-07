import { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLID } from "graphql";

export const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    _id: { type: GraphQLID },
    companyName: { type: GraphQLString },
    industry: { type: GraphQLString },
    address: { type: GraphQLString },
    companyEmail: { type: GraphQLString },
    bannedAt: { type: GraphQLString },
    approvedByAdmin: { type: GraphQLBoolean },
  }),
});
