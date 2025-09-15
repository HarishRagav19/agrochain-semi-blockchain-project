const CONTRACT_ADDRESS = "0xF4D297285994802696bA31448622ba70E9B8D66b";
const CONTRACT_ABI = [
  {"inputs":[{"internalType":"string","name":"_owner","type":"string"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_location","type":"string"}],"name":"addFarm","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_farmId","type":"uint256"},{"internalType":"string","name":"_cropType","type":"string"},{"internalType":"uint256","name":"_quantity","type":"uint256"}],"name":"addCrop","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"string","name":"action","type":"string"}],"name":"recordTransaction","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"}
];

let web3, account, contract;

async function init(){
  if(window.ethereum){
    web3 = new Web3(window.ethereum);
    document.getElementById('btnConnect').onclick = connectWallet;
    document.getElementById('btnAddFarm').onclick = addFarm;
    document.getElementById('btnAddCrop').onclick = addCrop;
    document.getElementById('btnRecordTx').onclick = recordTx;
    document.getElementById('btnFetchLedger').onclick = fetchLedger;
    document.getElementById('btnClearDisplay').onclick = ()=>{document.getElementById('ledgerOutput').innerText='';};
  } else {
    alert("MetaMask not found. Install MetaMask and retry.");
  }
}

async function connectWallet(){
  try{
    const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
    account = accs[0];
    document.getElementById('account').innerText = account;
    if(CONTRACT_ADDRESS === "PASTE_YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE"){
      alert("Paste the deployed contract address into frontend/js/app.js -> CONTRACT_ADDRESS");
    } else {
      contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    }
  }catch(e){ console.error(e); alert(e.message||e); }
}

function showMessage(msg){
  const out = document.getElementById('ledgerOutput');
  out.innerText = msg + "\n\n" + out.innerText;
}

async function addFarm(){
  const owner = document.getElementById('farmOwner').value || "Anonymous";
  const name = document.getElementById('farmName').value || "My Farm";
  const location = document.getElementById('farmLocation').value || "Unknown";
  if(!contract) return alert("Connect wallet and set contract address.");
  try{
    const resp = await contract.methods.addFarm(owner, name, location).send({from: account});
    const txHash = resp.transactionHash;
    showMessage(`Added farm — tx: ${txHash}`);

    // ✅ send txHash in "tx"
    await axios.post('http://localhost:4000/api/ledger', { 
      action: "AddFarm", 
      meta: { owner, name, location }, 
      tx: { hash: txHash }
    });
  }catch(e){ console.error(e); alert(e.message||e); }
}

async function addCrop(){
  const farmId = parseInt(document.getElementById('farmId').value||"0");
  const cropType = document.getElementById('cropType').value || "Unknown";
  const qty = parseInt(document.getElementById('cropQty').value||"0");
  if(!contract) return alert("Connect wallet and set contract address.");
  try{
    const resp = await contract.methods.addCrop(farmId, cropType, qty).send({from: account});
    const txHash = resp.transactionHash;
    showMessage(`Added crop — tx: ${txHash}`);

    await axios.post('http://localhost:4000/api/ledger', { 
      action: "AddCrop", 
      meta: { farmId, cropType, qty }, 
      tx: { hash: txHash }
    });
  }catch(e){ console.error(e); alert(e.message||e); }
}

async function recordTx(){
  const action = document.getElementById('txAction').value || "Generic";
  if(!contract) return alert("Connect wallet and set contract address.");
  try{
    const resp = await contract.methods.recordTransaction(action).send({from: account});
    const txHash = resp.transactionHash;
    showMessage(`Recorded tx on-chain — tx: ${txHash}`);

    await axios.post('http://localhost:4000/api/ledger', { 
      action: "RecordTransaction", 
      meta: { action }, 
      tx: { hash: txHash }
    });
  }catch(e){ console.error(e); alert(e.message||e); }
}

async function fetchLedger(){
  try{
    const resp = await axios.get('http://localhost:4000/api/ledger');
    const list = resp.data;
    if(!Array.isArray(list)) { showMessage("Invalid ledger data"); return; }
    const pretty = list.map(b=>`#${b.index} ${b.timestamp}\n${JSON.stringify(b.data)}\nhash:${b.hash}\nprev:${b.prevHash}`).join('\n\n');
    document.getElementById('ledgerOutput').innerText = pretty;
  }catch(e){ console.error(e); alert("Could not fetch ledger from backend. Is backend running?"); }
}

window.addEventListener('load', init);
