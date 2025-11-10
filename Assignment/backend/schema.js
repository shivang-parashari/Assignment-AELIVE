
import pkg from 'apollo-server-express';
const { gql} = pkg;
import { PubSub } from 'graphql-subscriptions';
import fs from 'fs-extra';

const pubsub = new PubSub();
const SUB_TRIGGER = 'NEW_SUBSTITUTION';

export const typeDefs = gql`
  type Substitution {
    playerOutName: String!
    playerOutNumber: Int!
    playerInName: String!
    playerInNumber: Int!
    time: String!
  }

  type Query {
    history: [Substitution!]!
  }

  type Mutation {
    addSubstitution(
      playerOutName: String!,
      playerOutNumber: Int!,
      playerInName: String!,
      playerInNumber: Int!
    ): Substitution!
  }

  type Subscription {
    substitutionAdded: Substitution!
  }
`;

export const resolvers = {
  Query: {
    history: async () => await fs.readJson('data.json').catch(() => [])
  },
  Mutation: {
    addSubstitution: async (_, args) => {
      const record = { ...args, time: new Date().toLocaleTimeString() };
      const data = await fs.readJson('data.json').catch(() => []);
      data.push(record);
      await fs.writeJson('data.json', data, { spaces: 2 });
      pubsub.publish(SUB_TRIGGER, { substitutionAdded: record });
      return record;
    }
  },
  Subscription: {
    substitutionAdded: {
      subscribe: () => pubsub.asyncIterator([SUB_TRIGGER])
    }
  }
};
