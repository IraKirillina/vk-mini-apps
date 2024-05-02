import React, { useState, useEffect } from 'react'; 
import { List, Cell, Avatar, Spinner, Div, Separator, Button, PanelHeader} from '@vkontakte/vkui'; 
import { BrowserRouter as Router, Link as RouterLink } from 'react-router-dom'; 
import { Link } from '@vkontakte/vkui';


const NewsList = () => { 
  const [news, setNews] = useState([]); 
  const [loading, setLoading] = useState(true); 
  
  const fetchNews = async () => { 
    try { 
      const response = await fetch('https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty'); 
      const stories = await response.json(); 
      
      const promises = stories.slice(0, 100).map(async (storyId) => {
        const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json?print=pretty`);
        return await storyResponse.json();
      });
      
      const newsData = await Promise.all(promises);
      const sortedNews = newsData.sort((a, b) => b.time - a.time);
      setNews(sortedNews);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching news:', error);
      setLoading(false);
    }
  };
      
      const handleRefresh = () => { 
        setLoading(true); 
        fetchNews(); 
      }; 
      
      useEffect(() => { 
        fetchNews();  
        
        const interval = setInterval(() => { 
          fetchNews(); 
        }, 60000); 
        
        return () => clearInterval(interval); 
      }, []); 
      
      return (
          <>
          <PanelHeader><div style={{ fontWeight: '500', fontSize: '25px', marginBottom: '8px', marginTop: '15px' }}>Hacker News</div></PanelHeader>
            <div style={{ display: 'flex', marginBottom: '8px', marginLeft: '16px' }}>
              <Button size="l" onClick={handleRefresh}>
                Обновить
              </Button>
            </div>
            {loading ? (
              <Spinner size="large" style={{ margin: '20px auto' }} />
            ) : (
              <List>
                {news.map((story, index) => (
                  <React.Fragment key={story.id}>
                    <Cell>
                      <Link href={`/news/${story.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ fontWeight: '500', fontSize: '18px', marginBottom: '8px' }}>
                          {index + 1}. {story.title}
                        </div>
                        <div style={{ fontSize: '14px', color: '#818C99' }}>
                          Автор: {story.by}, Дата: {new Date(story.time * 1000).toLocaleString()} Рейтинг: {story.score}
                        </div>
                      </Link>
                    </Cell>
                    {index !== news.length - 1 && <Separator />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </>
      );
}; 

export default NewsList;