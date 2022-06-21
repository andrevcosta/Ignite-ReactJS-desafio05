import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser } from 'react-icons/fi';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [newPostInfo, setNewPostInfo] = useState<PostPagination>();

  async function handleLoadPost() {
    const response = await fetch(`${postsPagination.next_page}`);
    const data = await response.json();

    const newNext_page = data.next_page;

    const newResults = data.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    const newPostsPagination = {
      next_page: newNext_page,
      results: newResults,
    };

    if (newPostsPagination.next_page === null) {
      postsPagination.next_page = null;
    }

    setNewPostInfo(newPostsPagination);
  }

  return (
    <>
      <Head>
        <title>spacetraveling | posts</title>
      </Head>

      <main className={commonStyles.container}>
        <div className={styles.content}>
          {postsPagination.results.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div className={styles.info}>
                  <div>
                    <FiCalendar />
                    <time>
                      {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy',
                        { locale: ptBR }
                      )}
                    </time>
                  </div>

                  <div>
                    <FiUser />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}

          {newPostInfo === undefined ? (
            ''
          ) : (
            <div className={styles.content}>
              {newPostInfo.results.map(post => (
                <Link key={post.uid} href={`/post/${post.uid}`}>
                  <a>
                    <h1>{post.data.title}</h1>
                    <p>{post.data.subtitle}</p>
                    <div className={styles.info}>
                      <div>
                        <FiCalendar />
                        <time>
                          {format(
                            new Date(post.first_publication_date),
                            'dd MMM yyyy',
                            { locale: ptBR }
                          )}
                        </time>
                      </div>

                      <div>
                        <FiUser />
                        <span>{post.data.author}</span>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}

          {postsPagination.next_page === null ? (
            ''
          ) : (
            <button type="button" onClick={handleLoadPost}>
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });

  const next_page = postsResponse.next_page;

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page,
    results,
  };

  return {
    props: { postsPagination },
    revalidate: 60 * 30, // 30 minutos
  };
};
