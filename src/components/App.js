import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Decentragram from '../abis/Decentragram.json'
import Navbar from './Navbar'
import Main from './Main'
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({host: 'ipfs.infura.io', port:5001, protocol: 'https'})


class App extends Component {

  // before render() method called, it runs this code. Lifecycle callbacl
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert("Non-Ethereum browser detected. Please enable MetaMask!")
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]})
    // console.log(accounts)

    const networkId = await web3.eth.net.getId()
    const networkData = Decentragram.networks[networkId]  // change this to 1 if you want main net

    if(networkData) {
      const decentragram = web3.eth.Contract(Decentragram.abi, networkData.address)
      this.setState({decentragram: decentragram})
      const postCount = await decentragram.methods.postCount().call() // need call() to call methods from blokchcain
      this.setState({postCount: postCount})

      // Load posts 
      for (var i=1; i <= postCount; i++) {
        const post = await decentragram.methods.posts(i).call()
        this.setState({
          posts: [...this.state.posts, post]
        })
      }

      // Sort posts (highest tipped first)
      this.setState({
        posts: this.state.posts.sort((a,b) => b.tipAmount - a.tipAmount)
      })

      this.setState({loading: false})
    } else {
      window.alert("Decentragram contract not deployed to selected network")
    }
  }

  captureFile = event => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({buffer: Buffer(reader.result)})
      console.log('buffer', this.state.buffer)
    }
  }

  uploadPost = description => {
    console.log("Submitting file to IPFS")

    ipfs.add(this.state.buffer, (error,result) => {
      console.log("IPFS result", result)
      if(error) {
        console.error(error)
        return
      }

      this.setState({loading: true})
      this.state.decentragram.methods.uploadPost(result[0].hash, description).send({from: this.state.account}).on('transactionHash',(hash) => {
        this.setState({loading: false})
      })
    }) 
  }

  tipImageOwner = (id, tipAmount) => {
    this.setState({loading: true})
    this.state.decentragram.methods.tipImageOwner(id).send({from: this.state.account, value: tipAmount}).on('transactionHash', (hash) => {
      this.setState({loading: false})
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      decentragram: null,
      posts: [],
      loading: true
    }
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
            captureFile={this.captureFile}
            uploadPost={this.uploadPost}
            posts={this.state.posts}
            tipImageOwner={this.tipImageOwner}
            />
          }
      </div>
    );
  }
}

export default App;