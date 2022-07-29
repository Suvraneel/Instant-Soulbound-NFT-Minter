/* eslint-disable no-unused-vars */
import { message, Card, Input, Button } from "antd";
import Text from "antd/lib/typography/Text";
import { useEffect, useState } from "react";
import {
  useMoralisFile,
  useMoralis,
  useWeb3ExecuteFunction,
} from "react-moralis";
import NativeBalance from "../NativeBalance";
import Address from "../Address/Address";
import Blockie from "../Blockie";

import ABI from "../../contracts/ABI.json";
const smartContractAddress = "0xEfEfc9b2B2790e30c277A4D1A2892d6142287e18";

const styles = {
  title: {
    fontSize: "30px",
    fontWeight: "600",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "5px",
  },
  card: {
    boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
    border: "1px solid #e7eaf3",
    borderRadius: "1rem",
    width: "450px",
    fontSize: "16px",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    outline: "none",
    fontSize: "16px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textverflow: "ellipsis",
    appearance: "textfield",
    color: "#041836",
    fontWeight: "700",
    border: "none",
    backgroundColor: "transparent",
  },
  select: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  textWrapper: { width: "100%", marginBottom: "2px" },
};

function CreateNFT() {
  const { saveFile } = useMoralisFile();
  const { Moralis, account } = useMoralis();
  const contractProcessor = useWeb3ExecuteFunction();

  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [isPending, setIsPending] = useState(0);
  const [nftReceiver, setNftReceiver] = useState("");
  // const [nftImage, setNftImage] = useState("");

  async function create() {
    // save image to IPFS
    setIsPending(1);
    const nftImage = document.getElementById("nftImage").files[0];
    const imageHash = await saveFile("nftImage", nftImage, {
      saveIPFS: true,
    }).then((res) => {
      console.log(res);
      return res;
    });
    const metadata = {
      name: nftName,
      description: nftDescription,
      image: imageHash._ipfs,
    };
    console.log(metadata);
    // create NFT
    const metadataFile = new Moralis.File("metadata.json", {
      base64: btoa(JSON.stringify(metadata)),
    });

    await metadataFile.saveIPFS();
    const metadataHash = await metadataFile.ipfs();
    console.log(metadataHash);
    setIsPending(2);
    const options = {
      contractAddress: smartContractAddress,
      functionName: "safeMint",
      abi: ABI,
      params: {
        to: nftReceiver,
        uri: metadataHash,
      },
    };
    await contractProcessor.fetch({
      params: options,
      onSuccess: () => message.success("NFT created successfully"),
      onError: (error) => message.error(error),
    });
    setIsPending(0);
    setNftName("");
    setNftDescription("");
    setNftReceiver("");
    document.getElementById("nftImage").value = null;
    // const nft = await createNFT(metadataHash).then((res) => {
    //   console.log(res);
    //   return res;
    // });
  }

  return (
    <div>
      <Card
        style={styles.card}
        title={
          <div style={styles.header}>
            <Blockie scale={5} avatar currentWallet style />
            <Address size="6" copyable />
            <NativeBalance />
          </div>
        }
      >
        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>Create NFT</Text>
          </div>
          <Input
            size="large"
            // prefix={<CreditCardOutlined />}
            type="text"
            placeholder="NFT Name"
            value={nftName}
            onChange={(e) => setNftName(e.target.value)}
          />
        </div>
        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>NFT Description</Text>
          </div>
          <Input
            size="large"
            // prefix={<CreditCardOutlined />}
            type="text"
            placeholder="NFT Description"
            value={nftDescription}
            onChange={(e) => setNftDescription(e.target.value)}
          />
        </div>
        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>NFT Receiver</Text>
          </div>
          <Input
            size="large"
            // prefix={<CreditCardOutlined />}
            type="text"
            placeholder="NFT Receiver"
            value={nftReceiver}
            onChange={(e) => setNftReceiver(e.target.value)}
          />
        </div>
        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>Upload NFT</Text>
          </div>
          <Input
            size="large"
            // prefix={<CreditCardOutlined />}
            type="file"
            placeholder="NFT Upload Media"
            id="nftImage"
          />
        </div>
        {/* <input type="file" placeholder="NFT Image" id="nftImage" /> */}
        {/* <button onClick={create}>Create NFT</button> */}
        {isPending === 0 ? (
          <Button
            type="primary"
            size="large"
            style={{ width: "100%", marginTop: "25px" }}
            onClick={create}
            // disabled={!tx}
          >
            Mint NFT ! 🎨
          </Button>
        ) : isPending === 1 ? (
          <Button
            type="primary"
            size="large"
            loading="true"
            style={{ width: "100%", marginTop: "25px" }}
            onClick={create}
            // disabled={!tx}
          >
            Uploading to IPFS 🖼️
          </Button>
        ) : (
          <Button
            type="primary"
            size="large"
            loading="true"
            style={{ width: "100%", marginTop: "25px" }}
            onClick={create}
            // disabled={!tx}
          >
            Calling Elon Musk to mint your NFT 📞
          </Button>
        )}
      </Card>
    </div>
  );
}

export default CreateNFT;
