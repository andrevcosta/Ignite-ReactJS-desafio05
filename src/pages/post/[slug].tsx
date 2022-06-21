import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const postWordsTotal = post.data.content.reduce((acc, item) => {
    const headingTotalWords = item.heading.trim().split(' ').length;

    const postBody = item.body.map(word => word.text.trim().split(' ').length);
    const bodyTotalWords = postBody.reduce((acc, word) => (acc += word));

    return (acc += headingTotalWords + bodyTotalWords);
  }, 0);

  const postReadTime = Math.ceil(postWordsTotal / 200);

  const router = useRouter();
  const routerFallback = router.isFallback;
  return (
    <>
      {routerFallback ? (
        <div>Carregando...</div>
      ) : (
        <>
          <Head>
            <title>{post.data.title} | spacetraveling</title>
          </Head>

          <div className={styles.banner}>
            <img src={post.data.banner.url} alt="banner" />
          </div>

          <main className={commonStyles.container}>
            <div className={styles.content}>
              <h1>{post.data.title}</h1>

              <div className={styles.info}>
                <div>
                  <FiCalendar />
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                </div>

                <div>
                  <FiUser />
                  <span>{post.data.author}</span>
                </div>

                <div>
                  <FiClock />
                  <span>{postReadTime} min</span>
                </div>
              </div>

              <article>
                {post.data.content.map(({ heading, body }) => (
                  <div key={heading} className={styles.postContent}>
                    <h2>{heading}</h2>

                    <div
                      dangerouslySetInnerHTML={{
                        __html: RichText.asHtml(body),
                      }}
                    />
                  </div>
                ))}
              </article>
            </div>
          </main>
        </>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');
  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: { post },
    revalidate: 30 * 60, // 30 minutos
  };
};
