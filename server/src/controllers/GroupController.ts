import Group from "../models/Group";

class GroupController{
    getAllGroups = async () => {
        let groups = await Group.getAllGroups()
        return groups
    }

    getGroupsByUser = async (userId: string) => {
        let groups = await Group.getGroupsByUser(userId)
        let ownedGroups = await Group.getOwnedGroups(userId)
        return {
            "owned": ownedGroups,
            "joined": groups
        }
    }

    getGroupById = async (groupId: string) => {
        return Group.getGroupById(groupId)
    }
}

export default new GroupController();