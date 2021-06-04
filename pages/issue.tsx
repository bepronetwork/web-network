import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import IssueHero from '../components/issue-hero';
import IssueListItem from '../components/issue-list-item';
import MainNav from '../components/main-nav';
import PageHero from '../components/page-hero';
import TypographyTest from '../components/typography-test';

export default function PageIssue() {
  return (
    <div>

      <MainNav></MainNav>
      <IssueHero></IssueHero>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h4 className="h4">Details</h4>
              <div className="d-flex align-items-center">
                <div className="avatar-list mr-1">
                  <img className="avatar circle-3"
                    src="https://randomuser.me/api/portraits/men/78.jpg"
                    alt=""
                  />
                  <img className="avatar circle-3"
                    src="https://uifaces.co/our-content/donated/gPZwCbdS.jpg"
                    alt=""
                  />
                  <img className="avatar circle-3"
                    src="https://uifaces.co/our-content/donated/Xp0NB-TL.jpg"
                    alt=""
                  />
                </div>
                <button className="btn btn-md btn-opac mr-1">View on github</button>
                <button className="btn btn-md btn-primary">Start working</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="content-wrapper mb-3">
              <h3 className="smallCaption mb-3">DESCRIPTION</h3>
              <p className="paragraph">
                Change the architecture of Application.getContractType()<br></br><br></br>
                Example<br></br>
                Instead of using<br></br><br></br>
                erc721Contract = app.getERC721Collectibles({ });<br></br><br></br>
                to use<br></br>
                import ERC721Collectibles from ...<br></br>
                let erc721Contract = new ERC721Collectibles();<br></br>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="content-wrapper">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="smallCaption mb-0">3 comments</h3>
                <button className="btn btn-md btn-opac">Reply on github</button>
              </div>
              <div className="content-wrapper child mb-3">
                <p className="smallParagraph trans">@aTavares 3 days ago</p>
                <p className="smallParagraph">Are you sure you got the first line right?</p>
              </div>
              <div className="content-wrapper child mb-3">
                <p className="smallParagraph trans">@sgoia 10 days ago</p>
                <p className="smallParagraph">I am working on this.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
}
