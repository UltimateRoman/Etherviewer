import { useRouter } from "next/router";
import React, { FormEventHandler, useEffect, useState } from "react";
import axios from "axios";
import { ethers, Contract, Signer } from "ethers";

import Chains from "../../public/chains.json";
import Default from "../../layouts/default";


const View = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [contract, setContract] = useState<Contract>();
    const [network, setNetwork] = useState<any>();
    const [contractData, setContractData] = useState<string>();
    const [walletSigner, setWalletSigner] = useState<Signer>();
    const [contractFunctions, setContractFunctions] = useState<any[]>([]);
    const [viewFunctions, setViewFunctions] = useState<string[]>([]);
    const [viewFunctionInputs, setViewFunctionInputs] = useState<any[]>();
    const [nonViewFunctionInputs, setNonViewFunctionInputs] = useState<any[]>([]);
    const [nonViewFunctions, setNonViewFunctions] = useState<string[]>([]);
    const [payableFunctions, setPayableFunctions] = useState<string[]>([]);
    const [nonPayableFunctions, setNonPayableFunctions] = useState<string[]>([]);
    const [selectedViewFunction, setSelectedViewFunction] = useState<string>(viewFunctions[0]);
    const [selectedNonViewFunction, setSelectedNonViewFunction] = useState<string>(nonViewFunctions[0]);

    const [formData, setFormData] = useState<any>({})

    const router = useRouter();
    const url = router.query.id;

    async function connectWallet() {
        if (typeof (window as any).ethereum !== 'undefined') {
            try {
                await (window as any)?.ethereum?.enable();
                await (window as any)?.ethereum?.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x' + network?.chainId?.toString(16) }],
                });
                const provider = new ethers.providers.Web3Provider((window as any)?.ethereum);
                const signer = provider?.getSigner();
                setWalletSigner(signer);
            } catch (error) {
                if ((error as any)?.code === 4902) {
                    try {
                        await (window as any)?.ethereum?.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainId: '0x' + network?.chainId?.toString(16),
                                    chainName: network?.name,
                                    nativeCurrency: network?.nativeCurrency,
                                    rpcUrls: [(network?.rpc?.filter((url: any) => !url.includes("API_KEY")))[0]],
                                },
                            ],
                        });
                        const provider = new ethers.providers.Web3Provider((window as any)?.ethereum);
                        const signer = provider?.getSigner();
                        console.log(signer)
                        setWalletSigner(signer);
                    } catch (addError) {
                        console.error(addError);
                    }
                }
                console.error(error);
            }
        } else {
            alert('MetaMask wallet not detected. Please consider installing it: https://metamask.io/download.html');
        }
    }

    useEffect(() => {
        async function checkData() {
            setLoading(true);
            if (url) {
                try {
                    const dataUrl = `https://ipfs.io/ipfs/${url}/data.json`;
                    const resp = await axios(dataUrl);
                    setContractData(resp?.data);
                    const abi = resp?.data?.abi;

                    const networkData = Chains?.find((nt: any) => nt?.name == resp?.data?.network) as any;
                    setNetwork(networkData);
                    const RPC = (networkData?.rpc?.filter((url: any) => !url.includes("API_KEY")))[0];
                    const provider = new ethers.providers.JsonRpcProvider(RPC);
                    const contractObject = new ethers.Contract(resp?.data?.address, resp?.data?.abi, provider);
                    setContract(contractObject);

                    const contractFunctions = abi?.filter((fn: any) => fn?.type === "function");
                    setContractFunctions(contractFunctions);

                    const viewFunctions = abi?.filter((fn: any) => fn?.stateMutability === "view") as any;
                    const viewFunctionNames = viewFunctions?.map((nt: any) => nt?.name);
                    const nonViewFunctions = abi?.filter((fn: any) => fn?.stateMutability !== "view" && fn?.type === "function");
                    const nonViewFunctionNames = nonViewFunctions?.map((nt: any) => nt?.name);
                    const nonPayableFunctions = nonViewFunctions?.filter((fn: any) => fn?.stateMutability === "nonpayable");
                    const nonPayableFunctionNames = nonPayableFunctions?.map((nt: any) => nt?.name);
                    const payableFunctions = nonViewFunctions?.filter((fn: any) => fn?.stateMutability === "payable");
                    const payableFunctionNames = payableFunctions?.map((nt: any) => nt?.name);

                    setViewFunctions(viewFunctionNames);
                    setNonViewFunctions(nonViewFunctionNames);
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const fnArguments: string[] = []
        viewFunctionInputs?.forEach(({ name }: { name: string }) => {
            fnArguments.push(formData?.[name] ?? "")
        })
        try {
            const result = await contract?.[selectedViewFunction]?.apply(null, fnArguments)
            console.log(result)
        } catch (e: any) {
            console.log(e)
        }
    }

    const handleFormDataChange = (e: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [e.target?.name]: e.target?.value
        }))
    }

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
                    <select
                        name="select"
                        id="select"
                        value={selectedViewFunction}
                        className="bg-gray-200 px-[10px] py-[7px] mt-[10px] rounded max-w-[400px] w-full"
                        onChange={e => {
                            setSelectedViewFunction(e.target.value);
                            const func = contractFunctions?.find((fn: any) => fn?.name === e.target.value) as any;
                            setViewFunctionInputs(func?.inputs);
                        }}
                    >
                        {viewFunctions?.map((viewFunc, key) => {
                            return (
                                <option key={key} value={viewFunc}>{viewFunc}</option>
                            );
                        })}
                    </select>
                </div>
                <form className="border p-[30px]" onSubmit={handleSubmit}>
                    {viewFunctionInputs?.map((inputParam, key) => {
                        return (
                            <input
                                type="text"
                                id="input"
                                className="bg-gray-100 px-[10px] py-[7px] mt-[20px] rounded max-w-[400px] w-full"
                                placeholder={inputParam?.name}
                                name={inputParam?.name}
                                onChange={handleFormDataChange}
                                required
                                key={key}
                            />
                        );
                    })}
                    <button className="font-semibold bg-blue-500 hover:bg-blue-400 transition-all duration-300 mt-[20px] ease-in-out text-white rounded px-[20px] py-[10px]">Query data</button>
                </form>
                <div className="border p-[30px] rounded-r">

                </div>
            </div>
            <div className="flex items-center justify-between w-full">
                <h2 className="text-2xl font-bold uppercase">State Mutating Functions</h2>
                <button
                    onClick={connectWallet}
                    className="font-semibold bg-blue-500 hover:bg-blue-400 transition-all duration-300 ease-in-out text-white rounded px-[20px] py-[10px]"
                >
                    Connect wallet
                </button>
            </div>
            <div className="grid grid-cols-3 min-h-[400px] mt-[30px] pb-[60px]">
                <div className="border p-[30px] rounded-l">
                    <select
                        name="select"
                        id="select"
                        value={selectedNonViewFunction}
                        className="bg-gray-200 px-[10px] py-[7px] mt-[10px] rounded max-w-[400px] w-full"
                        onChange={e => {
                            setSelectedNonViewFunction(e.target.value);
                            const func = contractFunctions?.find((fn: any) => fn?.name === e.target.value) as any;
                            setNonViewFunctionInputs(func?.inputs);
                        }}
                    >
                        {nonViewFunctions?.map((nonViewFunc, key) => {
                            return (
                                <option key={key} value={nonViewFunc}>{nonViewFunc}</option>
                            );
                        })}
                    </select>
                </div>
                <div className="border p-[30px]">
                    {nonViewFunctionInputs?.map((inputParam, key) => {
                        return (
                            <input
                                type="text"
                                id="input"
                                className="bg-gray-100 px-[10px] py-[7px] mt-[20px] rounded max-w-[400px] w-full"
                                placeholder={inputParam?.name}
                                required
                                key={key}
                            />
                        );
                    })}
                    <button className="font-semibold bg-blue-500 hover:bg-blue-400 transition-all duration-300 mt-[20px] ease-in-out text-white rounded px-[20px] py-[10px]">Send Tx</button>
                </div>
                <div className="border p-[30px] rounded-r">

                </div>
            </div>
        </Default>
    );
};

export default View;