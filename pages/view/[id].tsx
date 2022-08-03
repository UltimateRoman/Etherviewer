import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import axios from "axios";

const View = () => {
    const router = useRouter();
    const url = router.query.id;

    useEffect(() => {
        async function checkData() {
            if (url) {
                try {
                    const dataUrl = `https://${url}.ipfs.infura-ipfs.io/`;
                    const resp = await axios(dataUrl);
                    console.log(resp.data);
                } catch (e) {
                    console.log("Error:", e);
                    router.push("/");
                }
            }
        };
        checkData();
    }, [url]);

    return (
        <React.Fragment>
            <h2>View Smart Contract UI</h2>
        </React.Fragment>
    );
};

export default View;