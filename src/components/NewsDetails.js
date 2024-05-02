import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PanelHeader, Group, Cell, Button, Banner, Spinner, Link } from '@vkontakte/vkui';

const NewsDetails = () => {
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchNewsItem = async () => {
      try {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`);
        const data = await response.json();
        setNewsItem(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news item:', error);
        setLoading(false);
      }
    };

    fetchNewsItem();
  }, [id]);

  const fetchComments = async (commentIds, level) => {
    const comments = [];
  
    for (const commentId of commentIds) {
      try {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json?print=pretty`);
        const comment = await response.json();
        
        
        comments.push({ ...comment, level });
        
        
        if (comment.kids && comment.kids.length > 0) {
          const childComments = await fetchComments(comment.kids, level + 1); 
          comments.push(...childComments);
        }
      } catch (error) {
        console.error('Error fetching comment:', error);
      }
    }
  
    return comments;
  };
  

  const fetchRootComments = async () => {
    try {
      const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`);
      const newsItem = await response.json();
      
      if (newsItem.kids && newsItem.kids.length > 0) {
        const rootComments = await fetchComments(newsItem.kids, 0); 
        setComments(rootComments);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching root comments:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRootComments();
  }, [id]);

  const handleLoadChildComments = async (kids, level, parentId) => {
    const childComments = await fetchComments(kids, level);
    setComments(prevComments => {
      return prevComments.map(comment => {
        if (comment.id === parentId) {
          return { ...comment, children: childComments };
        } else if (comment.children) {
          return {
            ...comment,
            children: updateChildren(comment.children, parentId, childComments)
          };
        }
        return comment;
      });
    });
  };
  
  const updateChildren = (children, parentId, newChildren) => {
    return children.map(child => {
      if (child.id === parentId) {
        return { ...child, children: newChildren };
      } else if (child.children) {
        return { ...child, children: updateChildren(child.children, parentId, newChildren) };
      }
      return child;
    });
  };
  
  const handleRefreshComments = async () => {
    setLoading(true);
    await fetchRootComments(); 
  };

  const renderComments = (comments) => {
    return (
      <ul style={{ listStyle: 'none', paddingLeft: '40px', overflowWrap: 'break-word' }}>
        {comments.map(comment => (
          <React.Fragment key={comment.id}>
            {comment.level === 0 && (
              <li style={{ marginBottom: '16px' }}>
                <div style={{ marginBottom: '8px', fontWeight: '500', color: 'black', marginTop: '8px' }}>
                  {comment.by} | {formatDate(comment.time)} 
                </div>
                <div style={{ paddingLeft: `${comment.level * 40}px` }}>
                  <div dangerouslySetInnerHTML={{ __html: comment.text }} style={{ whiteSpace: 'pre-wrap' }}></div>
                </div>
                {comment.kids && comment.kids.length > 0 && (
                  <Button size="m" mode="secondary" onClick={() => handleLoadChildComments(comment.kids, comment.level, comment.id)}>Посмотреть все ответы</Button>
                )}
                {comment.children && renderComments(comment.children)}
              </li>
            )}
          </React.Fragment>
        ))}
      </ul>
    );
  };
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    const year = date.getFullYear() % 100;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedHours = hours < 10 ? '0' + hours : hours;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${day}.${month}.${year} ${formattedHours}:${formattedMinutes}`;
  };

  if (loading) {
    return <Spinner size="large" style={{ margin: '20px auto' }} />;
  }

  if (!newsItem) {
    return <Banner mode="error">Новость не найдена</Banner>;
  }

  const { title, by, time, url, descendants  } = newsItem;

  return (
    <>
      <PanelHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: '500', fontSize: '25px', marginBottom: '8px', marginTop: '15px' }}>
            {title}
          </div>
          <Button size="l"  onClick={() => navigate('/')}>На главную</Button>
        </div>
      </PanelHeader>

      <Group>
        <Cell>
          <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '8px' }}>
            <Link href={url} target="_blank" rel="noopener noreferrer">{title}</Link>
          </div>
          <div style={{ fontSize: '16px', color: '#818C99' }}>
            Автор: {by}, Дата: {formatDate(time)}
          </div>
        </Cell>
      </Group>
      {comments.length > 0 && (
        <Group>
          <Cell>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: '500', fontSize: '18px', marginBottom: '8px' }}>Комментарии ({descendants})</div>
              
            </div>
            <Button size="m" mode="secondary" onClick={handleRefreshComments}>Обновить комментарии</Button>
            <ul style={{ paddingLeft: '20px', overflowWrap: 'break-word', wordWrap: 'break-word' }}>
              {renderComments(comments)}
            </ul>
          </Cell>
        </Group>
      )}
      
    </>
  );
};

export default NewsDetails;
