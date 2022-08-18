import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ethers, Contract } from "ethers";

import Chains from "../../public/chains.json";

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

                    const networksData = Chains?.find((nt:any)=>nt?.name==resp?.data?.network) as any;
                    const RPC = (networksData?.rpc?.filter((url:any)=>!url.includes("API_KEY")))[0];
                    const provider = new ethers.providers.JsonRpcProvider(RPC);
                    const contractObject = new ethers.Contract(resp?.data?.address, resp?.data?.abi, provider);
                    setContract(contractObject);

                    const contractFunctions = abi.filter((fn:any)=>fn?.type=="function");
                    setContractFunctions(contractFunctions);

                    const viewFunctions = abi.filter((fn:any)=>fn?.stateMutability==="view");
                    const viewFunctionNames = viewFunctions.map((nt:any)=>nt?.name);
                    const nonViewFunctions = abi.filter((fn:any)=>fn?.stateMutability!=="view");
                    const nonPayableFunctions = nonViewFunctions.filter((fn:any)=>fn?.stateMutability==="nonpayable");
                    const nonPayableFunctionNames = nonPayableFunctions.map((nt:any)=>nt?.name);
                    const payableFunctions = nonViewFunctions.filter((fn:any)=>fn?.stateMutability==="payable");
                    const payableFunctionNames = payableFunctions.map((nt:any)=>nt?.name);

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
        <React.Fragment>
          <div className="min-h-[90vh] flex flex-col justify-start items-start w-full mx-auto my-[50px]">
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </React.Fragment>
      ) : (
        <React.Fragment>
            <h2>View Smart Contract UI</h2>
        </React.Fragment>
    );
};

export default View;