import React, { useState, useEffect, useCallback, useRef } from 'react';
import Feeds from './components/Feeds';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const PostButton = styled.div`
  position: fixed;
  bottom: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  right: 35px;
  z-index: 999;
  width: 55px;
  height: 55px;
  background: linear-gradient(90deg, rgb(125, 107, 255) 0%, rgb(52, 42, 255) 100%);
  border-radius: 50%;
  opacity: 0.9;
  cursor: pointer;
`;

export default function Feed() {
  const history = useHistory();
  if (sessionStorage.getItem('loginedUser') === null) {
    history.push('/');
  }

  const [feeds, setFeeds] = useState(null);
  const [feedData, setFeedData] = useState(null);
  const loginedId = JSON.parse(sessionStorage.getItem('loginedUser')).userId;
  const [pageInfo, setPageInfo] = useState('');

  const page = useRef(1);
  const jwtToken = JSON.parse(sessionStorage.getItem('loginedUser')).jwtToken;
  useEffect(() => {
    axios({
      method: 'get',
      url: `http://localhost:8080/board/${loginedId}`,
      headers: {
        Authorization : 'Bearer ' + jwtToken,
      }
    })
      .then(response => {

        const res = response.data;

        for (let i = 0; i < res.length; i++) {
          res[i].board_image = JSON.parse(res[i].board_image);
          res[i].hashArr = JSON.parse(res[i].hashArr);
          res[i].vote_contents = JSON.parse(res[i].vote_contents);
          // res[i].vote_users = JSON.parse(res[i].vote_users)
        }
        if (res.length < 4) {
          setFeeds(res);
        } else {
          setFeeds(res.slice(0, 4));
        }
        setFeedData(res);
        setPageInfo([res.length, parseInt(res.length / 4), res.length % 4]);
      })
      .catch(error => {})
      .finally(() => {});
  }, []);

  const scrollEvent = () => {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    if (
      page.current < pageInfo[1] &&
      scrollTop + clientHeight >= scrollHeight
    ) {
      const NewFeedList = feedData.slice(
        page.current * 4,
        page.current * 4 + 4
      );
      page.current += 1;
      setFeeds(prevFeed => [...prevFeed, ...NewFeedList]);
    } else if (
      page.current === pageInfo[1] &&
      scrollTop + clientHeight >= scrollHeight
    ) {
      const NewFeedList = feedData.slice(
        page.current * 4,
        page.current * 4 + pageInfo[2] + 1
      );
      page.current += 1;
      setFeeds(prevFeed => [...prevFeed, ...NewFeedList]);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', scrollEvent);
  }, [scrollEvent]);

  const onRemove = id => {
    axios({
      method: 'delete',
      url: `http://localhost:8080/board/delete/${id}`,
      headers: {
        Authorization : 'Bearer ' + jwtToken,
      }
    })
      .then(res => {
        setFeeds(feeds.filter(feed => feed.idboard !== id));
        window.location.replace('/feed');
      })
      .catch(err => {});
  };

  return (
    <div>
      <div style={{ marginTop: '75px' }}></div>
      <Feeds  feedData={feeds} onRemove={onRemove} />
      <PostButton onClick={() => history.push('/post')}>
        <i style={{ color: 'white', fontSize: "1.6rem" }} className="bi bi-plus-lg"></i>
      </PostButton>
    </div>
  );
}
