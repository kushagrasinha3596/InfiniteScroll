import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

const InfiniteScroller = (props) => {
  const [dataList, setDataList] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  let observerRef = useRef(null);

  const setLastElemRef = useCallback((node) => {
    if(observerRef.current){
      //For de-attaching the observer from old element, so that observer calback is not called if old element intersects with the viewport
      observerRef.current.disconnect();
    }
    if(node && !loading){
      let ioCallback = (entries) => {
        entries.forEach((entry) => {
          if(entry.isIntersecting){
            setPageNumber((currPageNum) => (currPageNum+1))
          }
        });
      }
      observerRef.current = new IntersectionObserver(ioCallback);
      observerRef.current.observe(node);
    }
  }, [loading]);

  useEffect(() => {
    setDataList([]);
    setPageNumber(1);
  }, [searchText]);

  useEffect(() => {
    let cancel;
    if(searchText){
      setLoading(true);
      axios({
        method: 'GET',
        url: 'http://openlibrary.org/search.json',
        params: { q: searchText, page: pageNumber },
        cancelToken: new axios.CancelToken((cancelToken) => cancel = cancelToken)
      }).then(res => {
        if (res && res.data && res.data.docs) {
          setDataList((prevDataList) => [...prevDataList, ...res.data.docs]);
        }
        setLoading(false);
      }).catch((err) => {
        if(axios.isCancel(err)) return;
        setDataList([]);
        setLoading(false);
      })
    }

    return () => {
      cancel ? cancel() : null
    };
  }, [searchText, pageNumber]);

  return (
    <React.Fragment>
    <div id="scroller-wrapper" style={{
      'height': '500px',
      'width': '300px',
      'overflowY': 'auto',
      'overflowX': 'hidden',
      'position': 'absolute',
      'top': '50%',
      'left': '50%',
      'transform': 'translate(-50%, -50%)',
      'border': '1px solid black'
    }}>
      <div style={{
      'border': '1px solid black',
      'left': '50%',
      'top': '18%',
      'height': '50px'
    }}>
      <input style={{'width': '100%', 'height': '100%'}} value={searchText} placeholder="Search Here" onChange={(event) => {setSearchText(event.target.value)}}></input>
    </div>
      {
        dataList.map((dataObj, index) => <div style={{
          'height': '100px',
          'width': '80%',
          'border': '1px solid blue',
          'margin': '8px',
          'overflow': 'hidden',
          'display': 'flex',
          'alignItems': 'center',
          'justifyContent': 'center',
          'margin': '10px auto'
        }} key={dataObj['key']}>
          {
            (index === dataList.length-1) ?
            <span ref={setLastElemRef}>{dataObj['title']}</span> : <span>{dataObj['title']}</span>
          }
        </div>)
      }
      {
        loading &&
        <h5 style={{'textAlign': 'center'}}>Loading...</h5>
      }
    </div>
    </React.Fragment>
  )
}

export default InfiniteScroller;