import {
  DAI_ADDRESS,
  EARTHVERSE_DEPOSIT_ADDRESS,
  EARTHVERSE_MARKETPLACE_ADDRESS,
  NFTD_ADDRESS,
  NFT_LAND_ADDRESS,
  USDC_ADDRESS,
} from "../constants/index";
import { useCallback, useEffect, useState } from "react";

import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import Button from "@mui/material/Button";
import ERC20Json from "../contractsData/ERC20ABI.json";
import EarthverseDepositJson from "../contractsData/EarthverseDepositABI.json";
import EarthverseMarketplaceJson from "../contractsData/EarthverseMarketplaceABI.json";
import FormControl from "@mui/material/FormControl";
import Header from "../components/Header";
import InputLabel from "@mui/material/InputLabel";
import Loading from "../components/Loading";
import MenuItem from "@mui/material/MenuItem";
import NFTLandJson from "../contractsData/NFTLandABI.json";
import React from "react";
import Select from "@mui/material/Select";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useSigner } from "wagmi";

export default function NFTMarketplace() {
  const [isLoading, setIsLoading] = useState(true);
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const [nftLandItems, setNftLandItems] = useState([]);
  const [stablecoin, setStablecoin] = React.useState("");

  const handleStablecoinChange = (event) => {
    setStablecoin(event.target.value);
  };

  const loadMarketplaceItems = useCallback(async () => {
    const earthverseMarketplace = new ethers.Contract(
      EARTHVERSE_MARKETPLACE_ADDRESS,
      EarthverseMarketplaceJson.abi,
      signer
    );

    const nftLand = new ethers.Contract(
      NFT_LAND_ADDRESS,
      NFTLandJson.abi,
      signer
    );

    const itemCount = await earthverseMarketplace.itemCount();
    let nftLandItemsClone = [];

    for (let i = 1; i <= itemCount; i++) {
      const nftLandItem = await earthverseMarketplace.listing(i);

      const uri = await nftLand.tokenURI(nftLandItem.tokenId);
      const response = await fetch(uri);
      const metadata = await response.json();

      nftLandItemsClone.push({
        id: nftLandItem.id,
        price: nftLandItem.price,
        seller: nftLandItem.seller,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
      });
    }

    setIsLoading(false);
    setNftLandItems(nftLandItemsClone);
  }, [signer]);

  const handleBuyNftLandClick = async (nftLandItem) => {
    const selectedStablecoinContract = new ethers.Contract(
      stablecoin,
      ERC20Json.abi,
      signer
    );
    const decimals = Number(await selectedStablecoinContract.decimals());

    await (
      await selectedStablecoinContract.approve(
        EARTHVERSE_DEPOSIT_ADDRESS,
        ethers.utils.parseUnits(nftLandItem.price.toString(), decimals)
      )
    ).wait();

    const earthverseDepositContract = new ethers.Contract(
      EARTHVERSE_DEPOSIT_ADDRESS,
      EarthverseDepositJson.abi,
      signer
    );

    await (
      await earthverseDepositContract.depositRPAndSendNFTLand(
        stablecoin,
        ethers.utils.parseUnits(nftLandItem.price.toString(), decimals),
        nftLandItem.id,
        decimals
      )
    ).wait();

    loadMarketplaceItems();
  };

  useEffect(() => {
    if (!signer) return;

    loadMarketplaceItems();
  }, [loadMarketplaceItems, signer]);

  if (isLoading) return <Loading />;

  return (
    <>
      <Header />
      {nftLandItems?.length > 0 ? (
        <div className="container-nft-land-box">
          {nftLandItems.map((item, idx) => (
            <div key={idx} className="nft-land-box">
              <img src={item.image} alt={item.name} />

              <div className="nft-land-box-actions">
                <div className="nft-land-box-actions-text">
                  <p>{item.name}</p>
                  <p>
                    {(ethers.utils.formatEther(item.price) * 10 ** 18).toFixed(
                      0
                    )}{" "}
                    NFTD
                  </p>
                </div>
                <p className="nft-land-box-actions-des">{item.description}</p>
                {address === item.seller ? (
                  <div className="nft-land-box-actions-buttons">
                    <h1>Owner</h1>
                  </div>
                ) : (
                  <div className="nft-land-box-actions-buttons">
                    <FormControl
                      sx={{ m: 1, minWidth: 150 }}
                      size="small"
                      color="primary"
                    >
                      <InputLabel id="stablecoin">Stablecoin</InputLabel>
                      <Select
                        labelId="stablecoin"
                        id="stablecoin"
                        value={stablecoin}
                        label="Stablecoin"
                        onChange={handleStablecoinChange}
                      >
                        <MenuItem value={USDC_ADDRESS}>USDC</MenuItem>
                        {/* <MenuItem value={20}>USDT</MenuItem> */}
                        <MenuItem value={DAI_ADDRESS}>DAI</MenuItem>
                      </Select>
                    </FormControl>

                    <Button
                      variant="contained"
                      disabled={stablecoin === ""}
                      onClick={() => handleBuyNftLandClick(item)}
                      startIcon={<AddShoppingCartIcon />}
                    >
                      Buy
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h2>No listed assets</h2>
        </div>
      )}
    </>
  );
}
