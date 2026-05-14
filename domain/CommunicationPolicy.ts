import { Actor, Player, Agent } from './entities/Actor';

export class CommunicationPolicy {
  /**
   * Only verified Agents/Scouts can initiate contact with Players.
   */
  static canInitiateChat(initiator: Actor, recipient: Actor): boolean {
    if (initiator.role === 'AGENT' || initiator.role === 'SCOUT') {
      if (initiator.status !== 'VERIFIED') {
        throw new Error('VerificationRequired: Only verified agents/scouts can initiate contact.');
      }
    }
    return true;
  }

  /**
   * Players must accept a request before an Agent can send further messages.
   */
  static canSendMessage(sender: Actor, recipient: Actor, hasAccepted: boolean): boolean {
    if ((sender.role === 'AGENT' || sender.role === 'SCOUT') && recipient.role === 'PLAYER') {
      if (!hasAccepted) {
        throw new Error('ConsentRequired: Player must accept the request first.');
      }
    }
    return true;
  }
}
