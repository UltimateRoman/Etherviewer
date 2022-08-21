import type { NextPage } from 'next';
import { FormEventHandler, useState } from 'react';
import Default from '../layouts/default';
import { File, Web3Storage } from 'web3.storage';
import { Button, useToast } from "@chakra-ui/react";
import { ethers } from "ethers";

import NetworkList from "../public/networks.json";

const client = new Web3Storage({ token: process.env.TOKEN !== undefined ? process.env.TOKEN : "null" } as any);

const Home: NextPage = () => {
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [network, setNetwork] = useState<string>(NetworkList?.network_names[0]);
  const [file, setFile] = useState<File | null>(null);

  const toast = useToast();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const check_address = ethers.utils.isAddress;
    if (!check_address(address)) {
      toast({
        title: "Invalid Address",
        description: `Invalid contract address`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    try {
      if (check_address(address)) {
        setLoading(true);
        const fileData = JSON.parse(await file?.text() as string);
        const contractData = {
          name: name,
          network: network,
          address: address,
          notes: notes,
          abi: fileData?.abi
        };
        const blob = new Blob([JSON.stringify(contractData)], { type: 'application/json' });
        const files = [new File([blob], 'data.json')];
        const cid = await client.put(files);
        toast({
          title: "Contract Data Uploaded Successfully",
          description: `View your contract at https://localhost:3000/view/${cid}`,
          status: "success",
          duration: 5000,
          isClosable: true
        });
        setLoading(false);
      }
    } catch (e) {
      toast({
        title: "Error",
        description: `Error occured, please try again`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.log("Error", e);
    }
  };

  return (
    <Default>
      <div className="min-h-screen flex flex-col items-start justify-center pt-[60px] mb-10">
        <h2 className="font-bold text-[36px] text-cyan-600">Etherviewer</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px] text-[16px] font-semibold mt-[10px] mb-[60px]">
          <li className="flex items-center justify-center px-[20px] py-[40px] text-center bg-gray-100 h-full flex-1 rounded">1. Upload your contract data using the form</li>
          <li className="flex items-center justify-center px-[20px] py-[40px] text-center bg-gray-100 h-full flex-1 rounded">2. Get a shareable link to your auto-generated contract UI</li>
          <li className="flex items-center justify-center px-[20px] py-[40px] text-center bg-gray-100 h-full flex-1 rounded">3. Share the link and interact with your smart contracts on Etherviewer</li>
        </ul>
        <form onSubmit={handleSubmit} className="flex flex-col w-full items-center justify-center text-left">
          <label htmlFor="name" className="text-lg md:text-xl text-left w-full max-w-[400px] font-bold lg:text-3xl">Contract Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="bg-gray-100 px-[10px] py-[7px] mt-[10px] rounded max-w-[400px] w-full"
            placeholder="Enter name of the smart contract"
            required
          />
          <label htmlFor="address" className="text-lg md:text-xl text-left w-full max-w-[400px] mt-[20px] font-bold lg:text-3xl">Contract Address</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="bg-gray-100 px-[10px] py-[7px] mt-[10px] rounded max-w-[400px] w-full"
            placeholder="Enter the smart contract address"
            required
          />
          <label htmlFor="network" className="text-lg md:text-xl text-left w-full max-w-[400px] mt-[20px] font-bold lg:text-3xl">EVM Network</label>
          <select
            id="network"
            value={network}
            onChange={e => setNetwork(e.target.value)}
            className="bg-gray-100 px-[10px] py-[7px] mt-[10px] rounded max-w-[400px] w-full"
            placeholder="Select EVM Network"
          >
            {NetworkList?.network_names?.map((network, key) => {
              return (
                <option key={key} value={network}>{network}</option>
              );
            })}
          </select>
          <label htmlFor="artifact" className="text-lg md:text-xl text-left w-full max-w-[400px] mt-[20px] font-bold lg:text-3xl">Contract Artifact</label>
          <input
            type="file"
            id="artifact"
            accept="application/json"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="bg-gray-100 px-[10px] py-[7px] mt-[10px] rounded max-w-[400px] w-full"
            placeholder="Upload JSON artifact"
            required
          />
          <label htmlFor="notes" className="text-lg md:text-xl text-left w-full max-w-[400px] mt-[20px] font-bold lg:text-3xl">Notes (Optional)</label>
          <textarea
            name="notes"
            id="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            className="bg-gray-100 px-[10px] py-[7px] mt-[10px] rounded max-w-[400px] w-full resize-none"
          >
          </textarea>
          <Button 
            className="bg-blue-900 hover:bg-blue-400 text-white mt-[20px] rounded px-[20px] w-full max-w-[400px] py-[10px]"
            colorScheme='blue'
            isLoading={loading}
            loadingText="Uploading..."
            type="submit"
          >
            Submit
          </Button>
        </form>
      </div>
    </Default>
  )
}

export default Home;
