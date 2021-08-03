import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
// import Alexandria from '../abis/Alexandria.json' // BCB1
// import Alexandria from '../abis/Alexandria.json' // BCB2

import Alexandria from '../abis/Alexandria.json';
import Navbar from './Navbar'
import Main from './Main'
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({host: 'ipfs.infura.io', port:5001, protocol: 'https'})


class App extends Component {

  // before render() method called, it runs this code. Lifecycle callback
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

    const networkId = await web3.eth.net.getId()

    // const networkData = Alexandria.networks[networkId]  // change this to 1 if you want main net
    const networkData = 31  // change this to 1 if you want main net

    if(networkData) {

      // const contractAddress = "0x1aA47235e66b8FaBe91888dCF3e43dCF58F41b7C"   //blackbook2   
      const contractAddress = "0x292DF9d771537DeF350C4e8B9A2D0E5b210E1Bf5" // Alexandria
      const alexandria = web3.eth.Contract(Alexandria, contractAddress)

      

      this.setState({alexandria: alexandria})
      const postCount = await alexandria.methods.postCount().call()
      console.log("Contract object: ", alexandria)
      this.setState({postCount: postCount})
      

      // Load posts 
      for (var i=1; i <= postCount; i++) {
        const post = await alexandria.methods.posts(i).call()
        console.log("POST: ", post)
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
      window.alert("Alexandria contract not deployed to selected network")
    }
  }

  captureFile = event => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({buffer: Buffer(reader.result)})
      // console.log('buffer', this.state.buffer)
    }
  }

  capturePostFile = event => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({postBuffer: Buffer(reader.result)})
      console.log('PB buffer', this.state.postBuffer)
    }
  }

  uploadPost = description => {
    console.log("Submitting files to IPFS")
    
    // Add Preview Image to IPFS
    ipfs.add(this.state.buffer, (error,result) => {
      console.log("IPFS result", result)
      if(error) {
        console.error(error)
        return
      }

      // Add File to IPFS
      ipfs.add(this.state.postBuffer, (error,postResult) => {
        console.log("IPFS result", postResult)
        if(error) {
          console.error(error)
          return
      }


      this.setState({loading: true})
      this.state.alexandria.methods.uploadPost(result[0].hash, description, postResult[0].hash).send({from: this.state.account}).on('transactionHash',(hash) => {
        this.setState({loading: false})
      })
    })}) 
  }

  tipPostAuthor = (id, tipAmount) => {
    this.setState({loading: true})
    this.state.alexandria.methods.tipPostAuthor(id).send({from: this.state.account, value: tipAmount}).on('transactionHash', (hash) => {
      this.setState({loading: false})
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      Alexandria: null,
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
            capturePostFile={this.capturePostFile}
            uploadPost={this.uploadPost}
            posts={this.state.posts}
            tipPostAuthor={this.tipPostAuthor}
            />
          }
      </div>
    );
  }
}

export default App;