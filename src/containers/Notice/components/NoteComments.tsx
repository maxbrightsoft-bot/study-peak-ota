import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet
} from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '@/theme'
import moment from 'moment'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import { ActivityIndicator } from 'react-native-paper'
import { NoteComment } from '../configs/types'
import { useNoteComments } from '../hooks/useNoteComments'

type Props = {
  noteId?: number
  visible?: boolean
  t: any
  headerContent?: React.ReactNode
}

const getInitials = (name?: string) => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const getAvatarBgColor = (name?: string) => {
  if (!name) return palette.main[500]
  const colors = ['#5F30AA', '#36BFEC', '#10B981', '#F59E0B', '#EC4899', '#6366F1']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

export const NoteComments = ({ noteId, visible, t, headerContent }: Props) => {
  const {
    comments,
    isLoading,
    isSending,
    text,
    setText,
    selectedImage,
    replyingTo,
    openDeleteConfirm,
    commentToDelete,
    loadingReplies,
    currentUser,
    handlePickImage,
    handleTakePhoto,
    handleRemoveImage,
    handleSetReplyingTo,
    handleCancelReply,
    handleSendComment,
    handlePromptDelete,
    handleDeleteComment,
    handleCloseDeleteConfirm,
    handleFetchReplies,
    handleCollapseReplies
  } = useNoteComments({ noteId, visible })

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [showImagePicker, setShowImagePicker] = useState(false)

  const canSend = (text.trim().length > 0 || !!selectedImage) && !isSending

  const renderCommentItem = (item: NoteComment, isReply: boolean = false) => {
    const isOwner = currentUser?.id === item?.createBy?.id
    const hasReplies = !!item.replies && item.replies.length > 0
    const hasUnloadedReplies = !hasReplies && (item.replyCount || 0) > 0
    const isLoadingThisReplies = loadingReplies[item.id]

    return (
      <View key={item.id} style={[styles.commentCard, isReply && styles.replyCard]}>
        <View style={styles.commentHeader}>
          <View style={styles.avatarRow}>
            {item.createBy?.avatar ? (
              <Image source={{ uri: item.createBy.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: getAvatarBgColor(item.createBy?.fullName) }]}>
                <Text style={styles.avatarInitial}>{getInitials(item.createBy?.fullName)}</Text>
              </View>
            )}
            <View style={styles.authorMeta}>
              <Text numberOfLines={1} style={styles.authorName}>
                {item.createBy?.fullName || item.createBy?.email || t('user')}
              </Text>
              <Text style={styles.commentTime}>
                {moment(item.createdAt).format('YY.MM.DD HH:mm')}
                {item.isEdited ? ` · ${t('edited') || 'Đã sửa'}` : ''}
              </Text>
            </View>
          </View>

          {isOwner && (
            <TouchableOpacity
              onPress={() => handlePromptDelete(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={16} color={palette.grey[400]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Comment Content */}
        {!!item.content && <Text style={styles.commentText}>{item.content}</Text>}

        {/* Comment Image */}
        {!!item.imageUrl && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setPreviewImageUrl(item.imageUrl || null)}
            style={styles.imageThumbnailContainer}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.commentImage} resizeMode="cover" />
          </TouchableOpacity>
        )}

        {/* Comment Actions */}
        {!isReply && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => handleSetReplyingTo(item)}
              style={styles.replyButton}
              activeOpacity={0.7}
            >
              <Ionicons name="return-down-forward-outline" size={14} color={palette.main[600]} />
              <Text style={styles.replyButtonText}>{t('reply')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* View Replies Button */}
        {!isReply && hasUnloadedReplies && (
          <TouchableOpacity
            onPress={() => handleFetchReplies(item.id)}
            style={styles.viewRepliesBtn}
            disabled={isLoadingThisReplies}
            activeOpacity={0.7}
          >
            {isLoadingThisReplies ? (
              <ActivityIndicator size={14} color={palette.main[600]} />
            ) : (
              <Ionicons name="chevron-down" size={14} color={palette.main[600]} />
            )}
            <Text style={styles.viewRepliesText}>
              {t('view_replies', { count: item.replyCount || 0 })}
            </Text>
          </TouchableOpacity>
        )}

        {/* Replies List */}
        {!isReply && hasReplies && (
          <View style={styles.repliesContainer}>
            {item.replies?.map(reply => renderCommentItem(reply, true))}
            <TouchableOpacity
              onPress={() => handleCollapseReplies(item.id)}
              style={styles.collapseRepliesBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-up" size={14} color={palette.grey[500]} />
              <Text style={styles.collapseRepliesText}>{t('collapse')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        {headerContent}

        <View style={styles.container}>
          {/* Header section */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="chatbubbles-outline" size={18} color={palette.main[600]} />
              <Text style={styles.sectionTitle}>{t('comments')}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{comments.length}</Text>
              </View>
            </View>
          </View>

          {/* Comment List */}
          <View style={styles.listContainer}>
            {isLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={palette.main[600]} />
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="chatbubble-ellipses-outline" size={36} color={palette.grey[300]} />
                <Text style={styles.emptyText}>{t('no_message') || 'Chưa có bình luận nào'}</Text>
              </View>
            ) : (
              comments.map(c => renderCommentItem(c, false))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Pinned Input Area */}
      <View style={styles.inputArea}>
        {/* Replying Banner */}
        {replyingTo && (
          <View style={styles.replyBanner}>
            <View style={styles.replyBannerContent}>
              <Ionicons name="return-down-forward" size={14} color={palette.main[600]} />
              <Text style={styles.replyBannerText} numberOfLines={1}>
                {t('reply')} @{replyingTo.createBy?.fullName || t('user')}
              </Text>
            </View>
            <TouchableOpacity onPress={handleCancelReply} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={palette.grey[400]} />
            </TouchableOpacity>
          </View>
        )}

        {/* Selected Image Preview */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
            <TouchableOpacity onPress={handleRemoveImage} style={styles.removeImageBtn}>
              <Ionicons name="close" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Row */}
        <View style={styles.inputRow}>
          <TouchableOpacity
            onPress={() => setShowImagePicker(true)}
            style={styles.attachBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            disabled={isSending}
          >
            <Ionicons name="image-outline" size={24} color={palette.grey[600]} />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder={replyingTo ? `${t('reply')}...` : `${t('comments')}...`}
            placeholderTextColor={palette.grey[400]}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
            editable={!isSending}
          />

          <TouchableOpacity
            onPress={handleSendComment}
            style={[styles.sendBtn, canSend && styles.sendBtnActive]}
            disabled={!canSend}
            activeOpacity={0.8}
          >
            {isSending ? (
              <ActivityIndicator size={16} color="#FFF" />
            ) : (
              <Ionicons name="send" size={16} color={canSend ? '#FFF' : palette.grey[400]} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={openDeleteConfirm}
        toggle={handleCloseDeleteConfirm}
        text={t('confirm_delete_message')}
        title={t('confirmation')}
        okText={t('yes') || t('confirm')}
        cancelText={t('no') || t('cancel')}
        onConfirm={() => commentToDelete && handleDeleteComment(commentToDelete)}
      />

      {/* Full Image Preview Modal */}
      <Modal
        visible={!!previewImageUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUrl(null)}
      >
        <View style={styles.fullImageOverlay}>
          <TouchableOpacity
            style={styles.closeFullImageBtn}
            onPress={() => setPreviewImageUrl(null)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={32} color="#FFF" />
          </TouchableOpacity>
          {previewImageUrl && (
            <Image source={{ uri: previewImageUrl }} style={styles.fullImage} resizeMode="contain" />
          )}
        </View>
      </Modal>

      {/* Image Picker Action Sheet */}
      {showImagePicker && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowImagePicker(false)}
          />
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('select_image_source')}</Text>
              <TouchableOpacity onPress={() => setShowImagePicker(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={palette.grey[600]} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                setShowImagePicker(false)
                setTimeout(() => {
                  handleTakePhoto?.()
                }, 200)
              }}
            >
              <View style={[styles.optionIconCircle, { backgroundColor: '#EBF5FF' }]}>
                <Ionicons name="camera" size={22} color={palette.main[500]} />
              </View>
              <Text style={styles.optionText}>{t('take_photo')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                setShowImagePicker(false)
                setTimeout(() => {
                  handlePickImage?.()
                }, 200)
              }}
            >
              <View style={[styles.optionIconCircle, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="images" size={22} color="#16a34a" />
              </View>
              <Text style={styles.optionText}>{t('choose_from_gallery')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetCancelButton}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.sheetCancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = ScaledSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: palette.bg[100]
  },
  scrollContent: {
    paddingBottom: '24@ms'
  },
  container: {
    marginTop: '16@ms',
    borderTopWidth: '8@ms',
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFF'
  },
  sectionHeader: {
    paddingHorizontal: '20@ms',
    paddingVertical: '14@ms',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: '1@ms',
    borderBottomColor: '#F3F4F6'
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  sectionTitle: {
    fontSize: '15@ms',
    fontWeight: '700',
    color: palette.grey[900]
  },
  countBadge: {
    backgroundColor: palette.main[50],
    paddingHorizontal: '8@ms',
    paddingVertical: '2@ms',
    borderRadius: '10@ms'
  },
  countBadgeText: {
    fontSize: '12@ms',
    fontWeight: '700',
    color: palette.main[600]
  },
  listContainer: {
    paddingHorizontal: '16@ms',
    paddingVertical: '12@ms'
  },
  loadingBox: {
    paddingVertical: '30@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyBox: {
    paddingVertical: '36@ms',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8@ms'
  },
  emptyText: {
    fontSize: '13@ms',
    color: palette.grey[400],
    fontWeight: '500'
  },
  commentCard: {
    paddingVertical: '12@ms',
    borderBottomWidth: '1@ms',
    borderBottomColor: '#F3F4F6'
  },
  replyCard: {
    paddingLeft: '12@ms',
    paddingVertical: '8@ms',
    borderBottomWidth: 0
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6@ms'
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10@ms',
    flex: 1
  },
  avatar: {
    width: '32@ms',
    height: '32@ms',
    borderRadius: '16@ms'
  },
  avatarPlaceholder: {
    width: '32@ms',
    height: '32@ms',
    borderRadius: '16@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarInitial: {
    fontSize: '12@ms',
    fontWeight: '700',
    color: '#FFF'
  },
  authorMeta: {
    flex: 1
  },
  authorName: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: palette.grey[900]
  },
  commentTime: {
    fontSize: '11@ms',
    color: palette.grey[400],
    marginTop: '2@ms'
  },
  deleteButton: {
    padding: '4@ms'
  },
  commentText: {
    fontSize: '14@ms',
    color: palette.grey[800],
    lineHeight: '20@ms',
    marginTop: '2@ms'
  },
  imageThumbnailContainer: {
    marginTop: '8@ms',
    borderRadius: '8@ms',
    overflow: 'hidden',
    width: '120@ms',
    height: '120@ms',
    backgroundColor: '#F3F4F6'
  },
  commentImage: {
    width: '100%',
    height: '100%'
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '8@ms',
    gap: '12@ms'
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4@ms'
  },
  replyButtonText: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: palette.main[600]
  },
  viewRepliesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms',
    marginTop: '8@ms',
    paddingVertical: '4@ms'
  },
  viewRepliesText: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: palette.main[600]
  },
  repliesContainer: {
    marginTop: '8@ms',
    marginLeft: '16@ms',
    paddingLeft: '12@ms',
    borderLeftWidth: '2@ms',
    borderLeftColor: '#E5E7EB',
    gap: '8@ms'
  },
  collapseRepliesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4@ms',
    paddingVertical: '4@ms',
    marginTop: '4@ms'
  },
  collapseRepliesText: {
    fontSize: '12@ms',
    color: palette.grey[500],
    fontWeight: '500'
  },
  inputArea: {
    backgroundColor: '#FFF',
    borderTopWidth: '1@ms',
    borderTopColor: '#E5E7EB',
    paddingHorizontal: '16@ms',
    paddingTop: '10@ms',
    paddingBottom: Platform.OS === 'ios' ? '24@ms' : '14@ms'
  },
  replyBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: palette.main[50],
    paddingHorizontal: '12@ms',
    paddingVertical: '6@ms',
    borderRadius: '8@ms',
    marginBottom: '8@ms'
  },
  replyBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms',
    flex: 1
  },
  replyBannerText: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: palette.main[600]
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '60@ms',
    height: '60@ms',
    borderRadius: '8@ms',
    overflow: 'hidden',
    marginBottom: '8@ms'
  },
  imagePreview: {
    width: '100%',
    height: '100%'
  },
  removeImageBtn: {
    position: 'absolute',
    top: '3@ms',
    right: '3@ms',
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: '18@ms',
    height: '18@ms',
    borderRadius: '9@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  attachBtn: {
    padding: '4@ms'
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: '20@ms',
    paddingHorizontal: '14@ms',
    paddingVertical: '8@ms',
    fontSize: '14@ms',
    color: palette.grey[900],
    maxHeight: '100@ms',
    minHeight: '38@ms',
    borderWidth: '1@ms',
    borderColor: '#E5E7EB'
  },
  sendBtn: {
    width: '36@ms',
    height: '36@ms',
    borderRadius: '18@ms',
    backgroundColor: palette.grey[200],
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendBtnActive: {
    backgroundColor: palette.main[600]
  },
  fullImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeFullImageBtn: {
    position: 'absolute',
    top: '40@ms',
    right: '20@ms',
    zIndex: 10
  },
  fullImage: {
    width: '90%',
    height: '80%'
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: 'flex-end'
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)'
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: '20@ms',
    borderTopRightRadius: '20@ms',
    paddingHorizontal: '20@ms',
    paddingTop: '16@ms',
    paddingBottom: '32@ms',
    gap: '10@ms'
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12@ms',
    borderBottomWidth: '1@ms',
    borderColor: palette.grey[100]
  },
  sheetTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#222222'
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '14@ms',
    paddingVertical: '12@ms',
    paddingHorizontal: '8@ms',
    borderRadius: '10@ms'
  },
  optionIconCircle: {
    width: '42@ms',
    height: '42@ms',
    borderRadius: '21@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },
  optionText: {
    fontSize: '15@ms',
    fontWeight: '500',
    color: '#222222'
  },
  sheetCancelButton: {
    marginTop: '6@ms',
    paddingVertical: '12@ms',
    borderRadius: '10@ms',
    backgroundColor: palette.grey[100],
    alignItems: 'center'
  },
  sheetCancelText: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: palette.grey[700]
  }
})

export default NoteComments
