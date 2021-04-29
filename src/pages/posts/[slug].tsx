import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"
import Head from "next/head"

import { RichText } from "prismic-dom"

import { format, parseISO } from 'date-fns'
import ptBr from 'date-fns/locale/pt-BR'

import { getPrismicClient } from "../../services/prismic"

import styles from './post.module.scss'

interface PostProps {
    post: {
        slug: string
        title: string
        content: string
        updatedAt: string
    }
}

export default function Post({ post }: PostProps) {
    return (
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>
            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>
                    <div
                        className={styles.postContent}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>
            </main>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
    const session = await getSession({req})
    const { slug } = params

    console.log(session?.activeSubscription)

    if (!session?.activeSubscription) {
        return {
            redirect: {
                destination: `/posts/preview/${slug}`,
                permanent: false
            }
        }
    }

    const prismic = getPrismicClient(req)

    const response = await prismic.getByUID('post', String(slug), {})

    const post = {
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content),
        updatedAt: format(parseISO(response.last_publication_date), 'd MMMM y', {
            locale: ptBr
        })
    }

    return {
        props: {
            post
        }
    }
}
