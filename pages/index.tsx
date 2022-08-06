import type { NextPage } from 'next'
import { FormEventHandler, useState } from 'react'
import Default from '../layouts/default'

const Home: NextPage = () => {
  const [name, setName] = useState<string>("")
  const [address, setAddress] = useState<string>("")
  const [network, setNetwork] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    console.log({
      name,
      address,
      network,
      file
    })
  }

  return (
    <Default>
      <div className="min-h-screen flex items-start justify-center pt-[60px]">
        <form onSubmit={handleSubmit} className="flex flex-col w-full items-center justify-center text-left">
          <label htmlFor="name" className="text-lg md:text-xl text-left w-full max-w-[400px] font-bold lg:text-3xl">Contract Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="bg-gray-100 px-[10px] py-[7px] mt-[10px] rounded max-w-[400px] w-full"
            placeholder="Enter name of the contract" required
          />
          <label htmlFor="address" className="text-lg md:text-xl text-left w-full max-w-[400px] mt-[20px] font-bold lg:text-3xl">Contract Address</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="bg-gray-100 px-[10px] py-[7px] mt-[10px] rounded max-w-[400px] w-full"
            placeholder="Enter address of the contract" required
          />
          <label htmlFor="network" className="text-lg md:text-xl text-left w-full max-w-[400px] mt-[20px] font-bold lg:text-3xl">Network</label>
          <select
            id="network"
            value={network}
            onChange={e => setNetwork(e.target.value)}
            className="bg-gray-100 px-[10px] py-[7px] mt-[10px] rounded max-w-[400px] w-full"
            placeholder="Select Network"
          >
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
          <label htmlFor="artifact" className="text-lg md:text-xl text-left w-full max-w-[400px] mt-[20px] font-bold lg:text-3xl">Contract Artifact</label>
          <input
            type="file"
            id="artifact"
            accept="application/json"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="bg-gray-100 px-[10px] py-[7px] mt-[10px] rounded max-w-[400px] w-full"
            placeholder="Enter address of the contract" required
          />
          <label htmlFor="notes" className="text-lg md:text-xl text-left w-full max-w-[400px] mt-[20px] font-bold lg:text-3xl">Notes</label>
          <textarea name="notes" id="notes" rows={4} className="bg-gray-100 px-[10px] py-[7px] mt-[10px] rounded max-w-[400px] w-full resize-none" required></textarea>
          <button className="bg-blue-500 hover:bg-blue-400 text-white mt-[20px] rounded px-[20px] w-full max-w-[400px] py-[10px]">Create</button>
        </form>
      </div>
    </Default>
  )
}

export default Home;
