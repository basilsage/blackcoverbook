import React, { Component } from 'react';
import Identicon from 'identicon.js';

class Main extends Component {

  render() {
    return (
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '500px' }}>
            <div className="content mr-auto ml-auto">
              <p>&nbsp;</p>
              <h2>Upload book</h2>
              <form onSubmit={(event) => {
                event.preventDefault() // what is this
                const description = this.imageDescription.value // possible bug here, naming
                this.props.uploadPost(description)
              }}>

              {/* Upload Thumbnail */}
              <br></br>              
              <label for="previewImageUpload">Preview Image (JPG, PNG)</label>
              <br></br>
              <input id="previewImageUpload" type='file' title="" accept=".jpg, .png" onChange={this.props.captureFile}></input>            
              <br></br>

              {/* Upload PDF File */}
              <br></br>              
              <label for="previewImageUpload">File Upload (PDF)</label>
              <br></br>
              <input id="previewImageUpload" type='file' title="" accept=".pdf" onChange={this.props.capturePostFile}></input>            
              <br></br>


              

              {/* Image Description */}
              <br></br>
              <div className="form-group mr-sm-2">
                <label for="imageDescription">Description</label>
                <input 
                  id="imageDescription"
                  type="text"
                  ref={(input) => {this.imageDescription = input}}
                  className="form-control"
                  required
                  >
                </input>

              </div>                
                  
                
                


                <br></br>
                <button type="submit" className="btn btn-primary btn-block btn-lg">Upload!</button>
              </form>

              <p>&nbsp;</p>
                {this.props.posts.map((image, key) => {
                  return(
                    <div className="card mb-4" key={key}>
                      <div className="card-header">
                      <img
                        className="mr-2"
                        width='30'
                        height='30'
                        src={`data:image/png;base64,${new Identicon(image.author, 30).toString()}`}                      
                      ></img>
                      <small className="text-muted">{image.author}</small>
                      </div>

                      <ul id="imageList" className="list-group list-group-flush">
                        <li className="list-group-item">
                          <p className="text-center">
                            <img src={`https://ipfs.infura.io/ipfs/${image.imageHash}`} style={{maxWidth: '420px'}}></img>
                          </p>
                          <p>{image.description}</p>
                          <form action={`https://ipfs.infura.io/ipfs/${image.postHash}`}>
                            <input type="submit" value="Open PDF" />
                          </form>
                        </li>
                        <li key={key} className="list-group-item py-2">
                            <small className="float-left mt-1 text-muted">
                              TIPS: {window.web3.utils.fromWei(image.tipAmount.toString(), 'Ether')} ETH
                            </small>
                            <button
                              className="btn btn-link btn-sm float-right pt-0"
                              name={image.id}
                              onClick={(event) => {
                                let tipAmount = window.web3.utils.toWei('0.01', 'Ether')
                                console.log(event.target.name, tipAmount)
                                this.props.tipPostAuthor(event.target.name, tipAmount)
                              }}
                            >
                              TIP 0.01 ETH
                            </button>

                        </li>
                      </ul>
                    </div>
                  )
                })}

            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default Main;