import elliptic from "elliptic"
import { useEffect, useState } from "react";
import { sha256 } from "js-sha256";
import md5 from "md5";
import axios from "axios"

export const App = () => {
    const ec = new elliptic.ec('secp256k1')
    const [currentUserPubHex, setCurrentUserPubHex] = useState("")
    const onClickGenPrivKeyBtn = () => {
        const pair = ec.genKeyPair()
        const priv_hex = pair.getPrivate("hex")
        const pub_hex = pair.getPublic("hex")
        setCurrentUserPubHex(pub_hex)
        navigator.clipboard.writeText(priv_hex).then(() => alert(`秘密鍵をクリップボードへコピーしました。`))
    }

    /* 現在パスの書き込み一覧を取得後に、そのパスを起点とした子パスを親パスの書き込み一覧も取得 */
    const [currentPathPosts, setCurrentPathPosts] = useState([])
    const [parentPathPosts, setParentPathPosts] = useState([])
    const [childPathPosts, setChildPathPosts] = useState([[]])

    const tmpf = (posts) => {
        let leaders = []
        const children = posts.map(post => {
            if (post => post.current_path !== post.parent_path) {
                leaders.push(post)
                return null
            }
            return post            
        })
        
       
    //    const current = posts.filter(post => post.current_path === window.location.pathname && post.parent_pathname === window.location.pathname)
       
       
       console.log(leaders)
       console.log(children)
    }

    useEffect(() => {
        //現在パスのデータを取得
        axios.get(`${process.env.REACT_APP_API_URL}${window.location.pathname}`)
            .then(r => tmpf(r.data))
            .catch(e => console.log(e))
    }, [])

    const onClickSendBtn = () => {
        const priv = ec.keyFromPrivate(inputPrivKey, 'hex')
        const xy = priv.getPublic("hex")
        const sign = priv.sign(sha256(message)).toDER("hex")
        axios.post(`${process.env.REACT_APP_API_URL}`, {
            "current_path": targetWritePath || decodeURI(window.location.pathname),
            "parent_path": decodeURI(window.location.pathname),
            "public_key_hex": xy,
            "screen_name": screenName,
            "der_signature": sign,
            "message": message
        })
            .then(() => {
                alert("送信しました")
                window.location.href = `${targetWritePath || '/'}`
            })
            .catch(e => console.log(e))
    }

    const [inputPrivKey, setInputPrivKey] = useState("初期値")
    const [screenName, setScreenName] = useState("風吹けば名無し")
    const [message, setMessage] = useState("")
    const [searchPath, setSearchPath] = useState("")
    const [targetWritePath, setTargetWritePath] = useState()

    return (
        <div className="App">
            <div>
                <p><a href="https://github.com/sugietaichi">github</a></p>
            </div>

            <hr />
            <h3>👤{md5(sha256(currentUserPubHex))}</h3>

            <hr />
            <h3>現在パス・親パス・子パスデータとりあえず置き場</h3>
            <p>【親パス】</p>
            <p>***</p>
            <p>【現在パス】</p>
            <h1><a href={`${decodeURI(window.location.pathname)}`}>{decodeURI(window.location.pathname)}</a></h1>
            <p>【子パス】</p>
            <ul>
                {childPathPosts && (
                    childPathPosts.map(r => (
                        <li>{r.current_path}</li>
                    ))
                )}
            </ul>

            {/*秘密鍵生成*/}
            <hr />
            <div className="generate_priv_key">
                <h3>秘密鍵生成</h3>
                <button onClick={onClickGenPrivKeyBtn}>秘密鍵生成</button>
            </div>

            {/*検索*/}
            <hr />
            <div className="search_path_input_area">
                <h3>パス検索</h3>
                ~/<input
                    type={"text"}
                    onChange={e => {
                        setSearchPath(e.target.value)
                    }}
                />
                <button onClick={() => window.location.href = `/${searchPath}`}>検索</button>
            </div>

            {/*api取得*/}
            <hr />
            <div className="fetch_posts">
                {
                    currentPathPosts && currentPathPosts.length ?  //todoこのへんよくわかんね
                        currentPathPosts.map((r, i) => {
                                const {
                                    public_key_hex, //公開鍵
                                    der_signature, //デジタル署名
                                    message, //本文
                                    screen_name, //ハンドルネーム
                                    current_path, //書き込み自体のパス
                                    parent_path,
                                    created_at, ///保存時間
                                } = r

                                return (
                                    <div key={i}>
                                        <hr />
                                        <label>{decodeURI(`${parent_path}`) + decodeURI(`${current_path}`)}</label><br />
                                        <label>{created_at}</label><br />
                                        <span>👤{`${md5(sha256(public_key_hex))}(${screen_name})`}</span><br />
                                        <span>🔑{md5(sha256(der_signature))}</span>
                                        <p>【本文】：{message}</p>
                                        <hr />
                                    </div>
                                )
                            })
                    :(
                        <div>
                         <hr />
                            <span>{window.location.pathname}</span><br />
                            <label>{new Date().toString()}</label><br />
                            <span>👤{`${md5(sha256("temp"))}${`[INFO]`}`}</span><br />
                            <span>🔑:{md5(sha256("tempp"))}</span>
                            <p>【本文】：{"このパスは作成されていません。"}</p>
                         <hr />
                    </div>
                    )
                }
            </div>

            {/*send post*/}
            <hr />
            <div className="send_posts">
                <div className="input_post_area">
                    <table border={10}>
                        <label>書き込み</label>
                        <tr>
                            <th>新規パス(新しくパスを作る場合のみ入力)</th>
                            <td>/ <input
                                type={"text"}
                                onChange={(e) => {
                                    setTargetWritePath(`/${e.target.value}`)
                                }}
                            /></td>
                        </tr>
                        <tr>
                            <th>秘密鍵(任意)</th>
                            <td><input
                                type={"password"}
                                onChange={(e) => {
                                    setInputPrivKey(e.target.value || "")
                                }}
                            /></td>
                        </tr>
                        <tr>
                            <th>名前(任意)</th>
                            <td><input
                                type={"text"}
                                value={screenName}
                                onChange={e => {
                                    setScreenName(e.target.value)
                                }}
                            /></td>
                        </tr>
                        <tr>
                            <th>メッセージ(必須)</th>
                            <td><textarea
                                type={"text"}
                                onChange={e => {
                                    setMessage(e.target.value)
                                }}
                            /></td>
                        </tr>
                        <tr>
                            <th></th>
                            <td>
                                <button onClick={onClickSendBtn}>書き込む</button>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    )
}


