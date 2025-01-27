import { GraphQLClient } from 'graphql-request';

export interface UserCache {
    _id: string,
    name: string,
    atcoderRate: number | null,
    atcoderHeuristicRate: number | null,
    codeforcesRate: number | null,
    timestamp: string,
}

export interface DBRecord {
    user: UserCache | null,
}

const GRAPHQL_ENDPOINT = 'https://graphql.fauna.com/graphql';
const client = new GraphQLClient(GRAPHQL_ENDPOINT, {
    headers: {
        authorization: `Bearer ${process.env.FAUNADB_SECRET}`,
    },
});

const fetchQuery = `\
query FetchUser($name: String!) {
    user: findUserByName(name: $name) {
        _id
        name
        atcoderRate
        atcoderHeuristicRate
        codeforcesRate
        timestamp
    }
}
`;

export async function getUserCache(name: string) {
    let data: DBRecord = await client.request(fetchQuery, { name });
    return data;
}

const registerQuery = `\
mutation RegisterUser($name: String!, $atcoderRate: Int, $atcoderHeuristicRate: Int, $codeforcesRate: Int, $timestamp: Time!) {
    createUser(data: {
      name: $name
      atcoderRate: $atcoderRate
      atcoderHeuristicRate: $atcoderHeuristicRate
      codeforcesRate: $codeforcesRate
      timestamp: $timestamp
    }) {
      name
      atcoderRate
      atcoderHeuristicRate
      codeforcesRate
      timestamp
    }
}
`;

export async function registerUserCache(name: string, atcoderRate: number | null, atcoderHeuristicRate: number | null, codeforcesRate: number | null) {
    await client.request(registerQuery, {
        name,
        atcoderRate,
        atcoderHeuristicRate,
        codeforcesRate,
        timestamp: new Date().toISOString(),
    });
}

const updateQuery = `\
mutation UpdateUser($id: ID!, $name: String!, $atcoderRate: Int, $atcoderHeuristicRate: Int, $codeforcesRate: Int, $timestamp: Time!) {
    updateUser(id: $id, data: {
        name: $name
        atcoderRate: $atcoderRate
        atcoderHeuristicRate: $atcoderHeuristicRate
        codeforcesRate: $codeforcesRate
        timestamp: $timestamp
    }) {
        name
        atcoderRate
        atcoderHeuristicRate
        codeforcesRate
        timestamp
    }
}
`;

export async function updateUserCache(cache: UserCache) {
    await client.request(updateQuery, {
        id: cache._id,
        name: cache.name,
        atcoderRate: cache.atcoderRate,
        atcoderHeuristicRate: cache.atcoderHeuristicRate,
        codeforcesRate: cache.codeforcesRate,
        timestamp: new Date().toISOString(),
    });
}
