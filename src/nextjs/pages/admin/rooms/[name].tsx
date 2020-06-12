import { useDocument } from '@nandorojo/swr-firestore'
import { useMemo, useState } from "react";
import { useClipboard } from "use-clipboard-copy"
import { Button } from '@material-ui/core';
import EditPassword from '../../../components/admin/EditPassword';
import { getHashString } from '../../../libs/Utils';
import * as firebase from "firebase"
import MyAdminMenu from '../../../components/admin/Menu';
import { Mic, People, Flag, Message } from '@material-ui/icons';
import EditTeams from '../../../components/admin/EditTeams';
import EditMembers from '../../../components/admin/EditMembers';
import EditMessages from '../../../components/admin/EditMessages';

const RoomAdminPage = (props) => {
	const { roomName, pwd, url } = props
	const origin = useMemo(() => (new URL(url).origin), [url])
	const clipboard = useClipboard()
	const room = useDocument<{ userPassword: string, updatedAt: firebase.firestore.FieldValue }>(`rooms/${roomName}`)
	const [contentName, setContentName] = useState("message")

	if (!room.data) {
		return (<div>fetching room data...</div>)
	}
	const handleChangePassword = password => {
		const pwd = getHashString(password)
		room.update({
			userPassword: pwd,
			updatedAt: firebase.firestore.FieldValue.serverTimestamp()
		})
	}
	const handleMenuSelect = hint => {
		setContentName(hint)
	}
	return (
		<>
			<MyAdminMenu
				title={`管理ページ - ${roomName}`}
				onSelect={handleMenuSelect}
				menus={[
					{
						title: "部屋",
						icon: <Mic />,
						hint: "room"

					},
					{
						title: "チーム",
						icon: <Flag />,
						hint: "team"

					},
					{
						title: "メンバー",
						icon: <People />,
						hint: "member"

					},
					{
						title: "メッセージ",
						icon: <Message />,
						hint: "message"

					},
				]}
			>
				{contentName === "room" ? (
					<>
						<EditPassword label="入室パスワードを設定" onSubmit={handleChangePassword} />
						<form>
							<Button
								variant="contained"
								onClick={() => {
									clipboard.copy(`${origin}/rooms/${roomName}?pwd=${room.data.userPassword}`)
								}}
							>
								パスワードを含む入室URLをクリップボードにコピー
				</Button>
							<Button
								variant="contained"
								onClick={() => {
									clipboard.copy(`${origin}/admin/rooms/${roomName}?&pwd=${pwd}`)
								}}
							>
								管理画面（ここ）のURLをクリップボードにコピー
				</Button>
						</form>
					</>
				) : ""}
				{contentName === "team" ? (
					<EditTeams roomName={roomName} />
				) : ""}
				{contentName === "member" ? (
					<EditMembers roomName={roomName} />
				) : ""}
				{contentName === "message" ? (
					<EditMessages roomName={roomName} />
				) : ""}
			</MyAdminMenu>
		</>
	)
}

export const getServerSideProps = ({ req, params, query }) => {
	return {
		props: {
			roomName: params.name,
			pwd: query.pwd,
			url: new URL(req.url, `http://${req.headers.host}`).href
		},
	}
}
export default RoomAdminPage