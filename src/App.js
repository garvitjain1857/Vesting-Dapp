import React, { useState, useEffect } from 'react';
import { Container, Box, TextField, Button, MenuItem, Typography } from '@mui/material';
import { ethers } from 'ethers';
import VestingContractABI from './VestingContractABI.json';

const contractAddress = "0x3b7150655733abf7cbdd3500a0a840a9402bcf7f";

const App = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [beneficiary, setBeneficiary] = useState("");
  const [role, setRole] = useState("");
  const [amount, setAmount] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        setIsMetaMaskInstalled(true);
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
      } else {
        setIsMetaMaskInstalled(false);
      }
    };

    init();
  }, []);

  const connectMetaMask = async () => {
    if (provider) {
      try {
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        setSigner(signer);
        const contract = new ethers.Contract(contractAddress, VestingContractABI, signer);
        setContract(contract);
        const address = await signer.getAddress();
        setUserAddress(address);
        console.log("MetaMask connected: ", address);
      } catch (error) {
        console.error("MetaMask connection error:", error);
      }
    }
  };

  const handleError = (error) => {
    console.error(error);
    alert(`An error occurred: ${error.message || JSON.stringify(error)}`);
  };

  const handleStartVesting = async () => {
    if (contract) {
      try {
        const vestingStarted = await contract.isVestingStarted();
        if (!vestingStarted) {
          const tx = await contract.startVesting({ gasLimit: 500000 });
          await tx.wait();
          console.log("Vesting started");
        } else {
          alert("Vesting has already started.");
        }
      } catch (error) {
        handleError(error);
      }
    }
  };

  const handleAddBeneficiary = async () => {
    if (contract) {
      try {
        const tx = await contract.addBeneficiary(beneficiary, role, ethers.utils.parseUnits(amount, 18), { gasLimit: 500000 });
        await tx.wait();
        console.log("Beneficiary added");
      } catch (error) {
        handleError(error);
      }
    }
  };

  const handleClaimTokens = async () => {
    if (contract) {
      try {
        const tx = await contract.claimTokens({ gasLimit: 500000 });
        await tx.wait();
        console.log("Tokens claimed");
      } catch (error) {
        handleError(error);
      }
    }
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Vesting Contract
        </Typography>

        {!isMetaMaskInstalled && (
          <Typography variant="body1" color="error">
            Please install MetaMask to use this application.
          </Typography>
        )}

        {isMetaMaskInstalled && !userAddress && (
          <Button variant="contained" onClick={connectMetaMask}>
            Connect MetaMask
          </Button>
        )}

        {isMetaMaskInstalled && userAddress && (
          <>
            <Box sx={{ my: 2 }}>
              <Button variant="contained" onClick={handleStartVesting}>
                Start Vesting
              </Button>
            </Box>

            <Box sx={{ my: 2 }}>
              <TextField
                label="Beneficiary Address"
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                select
                fullWidth
                sx={{ mb: 2 }}
              >
                <MenuItem value="0">User</MenuItem>
                <MenuItem value="1">Partner</MenuItem>
                <MenuItem value="2">Team</MenuItem>
              </TextField>
              <TextField
                label="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={handleAddBeneficiary}>
                Add Beneficiary
              </Button>
            </Box>

            <Box sx={{ my: 2 }}>
              <Button variant="contained" onClick={handleClaimTokens}>
                Claim Tokens
              </Button>
            </Box>

            <Typography variant="body1" sx={{ mt: 4 }}>
              Connected Address: {userAddress}
            </Typography>
          </>
        )}
      </Box>
    </Container>
  );
};

export default App;
