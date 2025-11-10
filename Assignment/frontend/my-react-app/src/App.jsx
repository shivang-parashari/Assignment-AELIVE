import React, { useState } from "react";
import { ApolloProvider, useMutation, gql } from "@apollo/client";
import { client } from "./graphql";
import IframeOverlay from "./IframeOverlay";

const ADD_SUB = gql`
  mutation AddSub(
    $playerOutName: String!, $playerOutNumber: Int!,
    $playerInName: String!, $playerInNumber: Int!
  ) {
    addSubstitution(
      playerOutName: $playerOutName, playerOutNumber: $playerOutNumber,
      playerInName: $playerInName, playerInNumber: $playerInNumber
    ) {
      playerOutName playerInName time
    }
  }
`;

function Dashboard() {
  const [form, setForm] = useState({ playerOutName: "", playerOutNumber: "", playerInName: "", playerInNumber: "" });
  const [addSub] = useMutation(ADD_SUB);

  const submit = async (e) => {
    e.preventDefault();
    await addSub({ variables: { ...form, playerOutNumber: +form.playerOutNumber, playerInNumber: +form.playerInNumber } });
    setForm({ playerOutName: "", playerOutNumber: "", playerInName: "", playerInNumber: "" });
  };

  return (
    <div className="p-6 max-w-md mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Substitution Control Panel</h1>
      <form onSubmit={submit}>
        {["playerOutName","playerOutNumber","playerInName","playerInNumber"].map(f=>(
          <input key={f} placeholder={f} value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})}
                 className="border p-2 w-full rounded" required />
        ))}
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Trigger Substitution</button>
      </form>
    </div>
  );
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <Dashboard/>
      <IframeOverlay/>
    </ApolloProvider>
  );
}
