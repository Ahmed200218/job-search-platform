import { GraphQLObjectType, GraphQLSchema, GraphQLList } from "graphql";
import { UserType } from "../user/user.graphql.js";
import { CompanyType } from "../company/company.graphql.js";
import { User } from "../../db/models/user.model.js";
import { Company } from "../../db/models/company.model.js";

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    allUsersAndCompanies: {
      type: new GraphQLObjectType({
        name: "UsersAndCompanies",
        fields: {
          users: { type: new GraphQLList(UserType) },
          companies: { type: new GraphQLList(CompanyType) },
        },
      }),
      resolve: async () => {
        const users = await User.find();
        const companies = await Company.find();
        return { users, companies };
      },
    },
  },
});

export const adminSchema = new GraphQLSchema({
  query: RootQuery,
});
