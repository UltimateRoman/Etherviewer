import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ethers, Contract } from "ethers";

import Chains from "../../public/chains.json";
import Default from "../../layouts/default";

const View = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [contract, setContract] = useState<Contract>();
    const [contractFunctions, setContractFunctions] = useState<any[]>([]);
    const [viewFunctions, setViewFunctions] = useState<string[]>([]);
    const [payableFunctions, setPayableFunctions] = useState<string[]>([]);
    const [nonPayableFunctions, setNonPayableFunctions] = useState<string[]>([]);

    const router = useRouter();
    const url = router.query.id;

    useEffect(() => {
        async function checkData() {
            setLoading(true);
            if (url) {
                try {
                    const dataUrl = `https://ipfs.io/ipfs/${url}/data.json`;
                    const resp = await axios(dataUrl);
                    const abi = resp?.data?.abi;

                    const networksData = Chains?.find((nt: any) => nt?.name == resp?.data?.network) as any;
                    const RPC = (networksData?.rpc?.filter((url: any) => !url.includes("API_KEY")))[0];
                    const provider = new ethers.providers.JsonRpcProvider(RPC);
                    const contractObject = new ethers.Contract(resp?.data?.address, resp?.data?.abi, provider);
                    setContract(contractObject);

                    const contractFunctions = abi.filter((fn: any) => fn?.type == "function");
                    setContractFunctions(contractFunctions);

                    const viewFunctions = abi.filter((fn: any) => fn?.stateMutability === "view");
                    const viewFunctionNames = viewFunctions.map((nt: any) => nt?.name);
                    const nonViewFunctions = abi.filter((fn: any) => fn?.stateMutability !== "view");
                    const nonPayableFunctions = nonViewFunctions.filter((fn: any) => fn?.stateMutability === "nonpayable");
                    const nonPayableFunctionNames = nonPayableFunctions.map((nt: any) => nt?.name);
                    const payableFunctions = nonViewFunctions.filter((fn: any) => fn?.stateMutability === "payable");
                    const payableFunctionNames = payableFunctions.map((nt: any) => nt?.name);

                    setViewFunctions(viewFunctionNames);
                    setPayableFunctions(payableFunctionNames);
                    setNonPayableFunctions(nonPayableFunctionNames);
                } catch (e) {
                    router.push("/");
                }
            }
            setLoading(false);
        };
        checkData();
    }, [url]);

    return loading ? (
        <Default>
            <div className="min-h-[90vh] flex flex-col justify-start items-start w-full mx-auto my-[50px]">
                <h1 className="text-2xl font-bold">Loading...</h1>
            </div>
        </Default>
    ) : (
        <Default>
            <h2 className="text-2xl font-bold uppercase">View Functions</h2>
            <div className="grid grid-cols-3 min-h-[400px] mt-[30px] pb-[60px]">
                <div className="border p-[30px] rounded-l">
                    <select name="select" id="select" className="bg-gray-100 px-[10px] py-[5px] rounded">
                        <option value="1">Select Menu</option>
                    </select>
                </div>
                <div className="border p-[30px]">

                </div>
                <div className="border p-[30px] rounded-r">

                </div>
            </div>
            <div className="flex items-center justify-between w-full">
                <h2 className="text-2xl font-bold uppercase">State Mutating Functions</h2>
                <button className="font-semibold bg-blue-500 hover:bg-blue-400 transition-all duration-300 ease-in-out text-white rounded px-[20px] py-[10px]">Connect Wallet</button>
            </div>
            <div className="grid grid-cols-3 min-h-[400px] mt-[30px] pb-[60px]">
                <div className="border p-[30px] rounded-l">
                    <select name="select" id="select" className="bg-gray-100 px-[10px] py-[5px] rounded">
                        <option value="1">Select Menu</option>
                    </select>
                </div>
                <div className="border p-[30px]">

                </div>
                <div className="border p-[30px] rounded-r">

                </div>
            </div>
        </Default>
    );
};

export default View;