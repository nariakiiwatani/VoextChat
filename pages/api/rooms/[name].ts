import { NextApiRequest, NextApiResponse } from 'next'
import { ServerContext } from "../../../libs/Models"
import { firstOf, filterProp, mapToArray, firstOfMap, findByProps, findOneByProps } from "../../../libs/Utils"
import { newDefaultRoom } from "../../../libs/Factory"


export type NextApiRequestWithContext = NextApiRequest & {
	context: ServerContext
}

const error = ({ status, message }) => (res: NextApiResponse) => {
	res.statusCode = status
	res.json({ error: message })
}

const createRoom = (req: NextApiRequestWithContext) => (res: NextApiResponse) => {
	const name = firstOf(req.query.name)
	const found = findOneByProps(req.context.rooms, name)
	if (found) {
		return error({ status: 400, message: `room:${name} already exists` })(res)
	}
	const room = newDefaultRoom(name)

	res.statusCode = 201
	res.json({ result: "ok", data: room })
}
const readRoom = (req: NextApiRequestWithContext) => (res: NextApiResponse) => {
	const name = firstOf(req.query.name)
	const room = findOneByProps(req.context.rooms, name)

	if (!room) {
		return error({ status: 400, message: `room:${name} not exists` })(res)
	}
	const params = (firstOf(req.query.params) || "").split(",").filter(v => v !== "")
	params.forEach(p => {
		room[p] = findByProps(req.context[p], { room: room.id })
	})

	res.statusCode = 200
	res.json({ result: "ok", data: room })
}
const updateRoom = (req: NextApiRequestWithContext) => (res: NextApiResponse) => {
	error({ status: 501, message: "update room is not implemented yet" })(res)
}
const deleteRoom = (req: NextApiRequestWithContext) => (res: NextApiResponse) => {
	error({ status: 501, message: "delete room is not implemented yet" })(res)
}

const RoomAPI = (req: NextApiRequestWithContext, res: NextApiResponse) => {
	switch (req.method) {
		case "GET":
			readRoom(req)(res)
			break;
		case "POST":
			createRoom(req)(res)
			break;
		case "UPDATE":
			updateRoom(req)(res)
			break;
		case "DELETE":
			deleteRoom(req)(res)
			break;
	}
}
export default RoomAPI