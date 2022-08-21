import { useRouter } from "next/router";
import React, { FormEventHandler, useEffect, useState } from "react";
import axios from "axios";
import { ethers, Contract, Signer } from "ethers";
import { Button } from "@chakra-ui/react";

import Chains from "../../public/chains.json";
import Default from "../../layouts/default";


const View = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [processing, setProcessing] = useState<boolean>(false);
    const [contract, setContract] = useState<Contract>();
    const [network, setNetwork] = useState<any>();
    const [contractData, setContractData] = useState<any>();
    const [userAddress, setUserAddress] = useState<string>("");
    const [isConnected, setConnected] = useState<boolean>(false);
    const [txStatus, setTxStatus] = useState<string>("");
    const [txValue, setTxValue] = useState<bigint>(BigInt(0));
    const [walletSigner, setWalletSigner] = useState<Signer>();
    const [contractFunctions, setContractFunctions] = useState<any[]>([]);
    const [viewFunctions, setViewFunctions] = useState<string[]>([]);
    const [viewFunctionInputs, setViewFunctionInputs] = useState<any[]>();
    const [viewFunctionOuput, setViewFunctionOutput] = useState<string>("");
    const [nonViewFunctionInputs, setNonViewFunctionInputs] = useState<any[]>([]);
    const [nonViewFunctions, setNonViewFunctions] = useState<string[]>([]);
    const [payableFunctions, setPayableFunctions] = useState<string[]>([]);
    const [nonPayableFunctions, setNonPayableFunctions] = useState<string[]>([]);
    const [selectedViewFunction, setSelectedViewFunction] = useState<string>(viewFunctions[0]);
    const [selectedNonViewFunction, setSelectedNonViewFunction] = useState<string>(nonViewFunctions[0]);

    const [formData, setFormData] = useState<any>({});
    const [formData1, setFormData1] = useState<any>({});

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
                setConnected(true);
                setUserAddress(await signer.getAddress());
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
                        setWalletSigner(signer);
                        setConnected(false);
                        setUserAddress(await signer.getAddress());
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
        setProcessing(true);
        const fnArguments: any[] = []
        viewFunctionInputs?.forEach(({ name }: { name: any }) => {
            fnArguments.push(formData?.[name] ?? "");
        })
        try {
            let result = await contract?.[selectedViewFunction]?.apply(null, fnArguments);
            const viewFunc = contractData?.abi?.find((fn: any) => fn?.name === selectedViewFunction) as any;
            if (viewFunc?.outputs?.length > 1) {
                Object.keys(result).forEach(function(key, index) {
                    result[key] = result[key].toString();
                });
                setViewFunctionOutput(JSON.stringify(result));
            } else {
                setViewFunctionOutput(result.toString());
            }
        } catch (e: any) {
            console.log(e);
            setViewFunctionOutput("Error occured while making the call");
        }
        setProcessing(false);
    }

    const sendTx = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);
        setTxStatus("Loading...");
        const fnArguments: any[] = []
        nonViewFunctionInputs?.forEach(({ name }: { name: any }) => {
            fnArguments.push(formData1?.[name] ?? "");
        });
        const selectedFuncIsPayable = payableFunctions?.find((fn: any) => fn === selectedNonViewFunction) as any;
        if (selectedFuncIsPayable !== undefined) {
            fnArguments.push({value: txValue});
        }
        try {
            const contractObj = new ethers.Contract(contractData?.address, contractData?.abi, walletSigner);
            const tx = await contractObj?.[selectedNonViewFunction]?.apply(null, fnArguments);
            await tx?.wait();  
            setTxStatus(`Transaction successful with hash: ${tx?.hash}`);          
        } catch (e: any) {
            console.log(e);
            if (e?.code === 4001) {
                setTxStatus("Transaction was rejected by the user");
            } else {
                setTxStatus("Error occured while sending the transaction");
            }
        }
        setProcessing(false);
    }

    const handleFormDataChange = (e: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [e.target?.name]: e.target?.value
        }))
    }

    const handleFormDataChange1 = (e: any) => {
        setFormData1((prev: any) => ({
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
            <h2 className="text-2xl mt-10 text-blue-600 font-bold uppercase">{contractData?.name}</h2>
            <h2 className="text-xl font-semibold text-teal-800">Network: {contractData?.network}</h2>
            <h2 className="text-lg text-gray-600 font-medium">Contract Address: {contractData?.address}</h2>
            <br/><br/>
            <h2 className="text-2xl font-bold uppercase">View Functions</h2>
            <div className="grid grid-cols-3 min-h-[400px] mt-[30px] pb-[60px] bg-zinc-50">
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
                                className="bg-white-100 px-[10px] py-[7px] mt-[20px] rounded max-w-[400px] w-full text-black border-2 border-black"
                                placeholder={inputParam?.name}
                                name={inputParam?.name}
                                onChange={handleFormDataChange}
                                required
                                key={key}
                            />
                        );
                    })}
                    <Button 
                        className="font-semibold bg-blue-500 hover:bg-blue-400 transition-all duration-300 mt-[20px] ease-in-out text-white rounded px-[20px] py-[10px]"
                        colorScheme='blue'
                        isLoading={processing}
                        loadingText="Querying..."
                        type="submit"
                    >
                        Query data
                    </Button>
                </form>
                <div className="border p-[30px] rounded-r">
                    <p className="font-sans mb-6 text-xl font-semibold">OUTPUT</p>
                    <p className="font-sans text-medium">{viewFunctionOuput}</p>
                </div>
            </div>
            <br/>
            <div className="flex items-center justify-between w-full mt-5">
                <h2 className="text-2xl font-bold uppercase">State Mutating Functions</h2>
                <button
                    onClick={connectWallet}
                    className="font-semibold bg-green-700 hover:bg-green-600 transition-all duration-300 ease-in-out text-white rounded px-[20px] py-[10px]"
                    disabled={isConnected}
                >
                    {isConnected ? "Connected" : "Connect Wallet"}
                </button>
                <span>{isConnected ? userAddress : null}</span>
            </div>
            <div className="grid grid-cols-3 min-h-[400px] mt-[30px] pb-[60px] bg-zinc-50 mb-10">
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
                <form className="border p-[30px]" onSubmit={sendTx}>
                    {nonViewFunctionInputs?.map((inputParam, key) => {
                        return (
                            <input
                                type="text"
                                id="input"
                                className="bg-white px-[10px] py-[7px] mt-[20px] rounded max-w-[400px] w-full text-black border-2 border-black"
                                placeholder={inputParam?.name}
                                required
                                key={key}
                                onChange={handleFormDataChange1}
                                name={inputParam?.name}
                            />
                        );
                    })}
                    <p className="text-gray-800 mt-[15px] mb-1">Value to send (wei)</p>
                    <input
                        type="text"
                        id="input"
                        name="txvalue"
                        value={txValue?.toString()}
                        className="bg-white-100 px-[10px] py-[7px] mt-[20px] rounded max-w-[400px] w-full text-black border-2 border-black"
                        onChange={e => setTxValue(BigInt(e.target.value))}
                    />
                    <Button 
                        className="font-semibold bg-blue-500 hover:bg-blue-400 transition-all duration-300 mt-[20px] ease-in-out text-white rounded px-[20px] py-[10px]"
                        disabled={!isConnected}
                        colorScheme='blue'
                        isLoading={processing}
                        loadingText="Sending..."
                        type="submit"
                    >
                        Send Tx  
                    </Button>
                </form>
                <div className="border p-[30px] rounded-r">
                    <p className="font-sans mb-6 text-xl font-semibold">TX STATUS</p>
                    <p className="font-sans text-medium">{txStatus}</p>
                </div>
            </div>
        </Default>
    );
};

export default View;